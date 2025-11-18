import { getMessaging, getToken, isSupported, Messaging, onMessage } from 'firebase/messaging';
import { apiClient } from './api';
import { firebaseConfig } from './firebase';

type DevicePlatform = 'ios' | 'android' | 'web' | 'unknown';

interface MessagePayload {
  data?: Record<string, string>;
  notification?: {
    title?: string;
    body?: string;
  };
}

type MessageHandler = (payload: MessagePayload) => void;

const DEVICE_ID_STORAGE_KEY = 'gigafit_device_id';

class FCMService {
  private messaging: Messaging | null = null;
  private initialized = false;
  private currentToken: string | null = null;
  private initializationPromise: Promise<void> | null = null;
  private unsubscribeOnMessage?: () => void;
  private handlers: Set<MessageHandler> = new Set();
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private configPosted = false;
  private initializationFailed = false; // Track if initialization failed to prevent retries

  private getDeviceId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  }

  private ensureDeviceId(): string {
    if (typeof window === 'undefined') return '';
    const existing = this.getDeviceId();
    if (existing) return existing;
    const deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    return deviceId;
  }

  private detectPlatform(): DevicePlatform {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    if (/mac|win|linux/.test(ua)) return 'web';
    return 'unknown';
  }

  private async ensureMessaging(): Promise<Messaging | null> {
    if (typeof window === 'undefined') return null;
    const supported = await isSupported().catch(() => false);
    if (!supported) {
      console.warn('[FCM] Messaging not supported in this browser.');
      return null;
    }
    if (!this.messaging) {
      this.messaging = getMessaging();
    }
    return this.messaging;
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      console.warn('[FCM] Service workers are not supported in this environment.');
      return null;
    }

    if (this.serviceWorkerRegistration) {
      return this.serviceWorkerRegistration;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
      );
      return this.serviceWorkerRegistration;
    } catch (error) {
      console.error('[FCM] Failed to register messaging service worker:', error);
      return null;
    }
  }

  private async sendConfigToServiceWorker(
    registration: ServiceWorkerRegistration,
  ): Promise<void> {
    if (this.configPosted) return;

    const postToWorker = (worker: ServiceWorker | null): boolean => {
      if (!worker) return false;
      try {
        worker.postMessage({
          type: 'FIREBASE_CONFIG',
          payload: firebaseConfig,
        });
        this.configPosted = true;
        return true;
      } catch (error) {
        // Service worker might not be ready to receive messages yet
        // This is harmless - the service worker will load config from IndexedDB
        return false;
      }
    };

    // Wait for service worker to be ready with retry
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await registration.update();
        const readyRegistration = await navigator.serviceWorker.ready;
        
        if (readyRegistration.active) {
          if (postToWorker(readyRegistration.active)) {
            return;
          }
        }
      } catch (error) {
        // Ignore errors - will retry or fallback
      }

      // Wait a bit before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }

    // Fallback: try posting to available workers
    if (registration.active && postToWorker(registration.active)) {
      return;
    }

    if (registration.waiting && postToWorker(registration.waiting)) {
      return;
    }

    // If still not posted, set up listener for when worker becomes active
    if (registration.installing) {
      const installingWorker = registration.installing;
      const stateChangeHandler = (): void => {
        if (installingWorker.state === 'activated' && registration.active) {
          postToWorker(registration.active);
          installingWorker.removeEventListener('statechange', stateChangeHandler);
        }
      };
      installingWorker.addEventListener('statechange', stateChangeHandler);
    }

    // If we still couldn't post, that's okay - service worker will load from IndexedDB
    // The error is harmless and won't affect functionality
  }

  private subscribeToForegroundMessages(): void {
    if (!this.messaging || this.unsubscribeOnMessage) return;
    this.unsubscribeOnMessage = onMessage(this.messaging, (payload) => {
      this.handlers.forEach((handler) => handler(payload as MessagePayload));
    });
  }

  addMessageListener(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  async initMessaging(forceRegister = false): Promise<void> {
    // Don't retry if initialization previously failed (unless forced)
    if (this.initializationFailed && !forceRegister) {
      return;
    }

    if (this.initializationPromise && !forceRegister) {
      await this.initializationPromise;
      return;
    }

    this.initializationPromise = this.initialize(forceRegister)
      .catch((error) => {
        // Mark as failed to prevent infinite retries
        this.initializationFailed = true;
        throw error;
      })
      .finally(() => {
        this.initializationPromise = null;
      });
    await this.initializationPromise;
  }

  private async initialize(forceRegister: boolean): Promise<void> {
    const messaging = await this.ensureMessaging();
    if (!messaging) {
      return;
    }

    if (!('Notification' in window)) {
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      return;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('[FCM] Missing VITE_FIREBASE_VAPID_KEY. Push notifications disabled.');
      return;
    }

    try {
      const registration = await this.registerServiceWorker();
      if (!registration) {
        return;
      }

      await this.sendConfigToServiceWorker(registration);

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (!token) {
        console.warn('[FCM] Unable to retrieve FCM token.');
        return;
      }


      if (!forceRegister && token === this.currentToken && this.initialized) {
        this.subscribeToForegroundMessages();
        return;
      }

      this.currentToken = token;
      const deviceId = this.ensureDeviceId();
      const platform = this.detectPlatform();
      
      try {
        await apiClient.post('/user/device-token', {
          deviceId,
          token,
          platform,
        });
        // Reset failed flag on success
        this.initializationFailed = false;
      } catch (error: any) {
        // Handle API errors gracefully
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          console.warn('[FCM] Not authenticated - skipping token registration');
          // Don't mark as failed for auth errors - user might not be logged in yet
          // Still allow FCM to work locally (foreground messages)
          this.initializationFailed = false;
        } else {
          // For other errors, log but don't throw - allow FCM to work locally
          console.warn('[FCM] Failed to register token with backend:', error);
          // Don't mark as failed - allow retry on next auth
          this.initializationFailed = false;
        }
      }

      // Mark as initialized even if backend registration failed
      // FCM can still work for foreground messages
      this.initialized = true;
      this.subscribeToForegroundMessages();
    } catch (error) {
      console.error('[FCM] Failed to initialize messaging:', error);
      this.initializationFailed = true;
      throw error;
    }
  }

  async cleanupToken(): Promise<void> {
    const deviceId = this.getDeviceId();
    if (!deviceId) return;

    try {
      await apiClient.delete(`/user/device-token/${deviceId}`);
    } catch (error) {
      console.warn('[FCM] Failed to remove device token:', error);
    }

    this.currentToken = null;
    this.initialized = false;
    if (this.unsubscribeOnMessage) {
      this.unsubscribeOnMessage();
      this.unsubscribeOnMessage = undefined;
    }
  }
}

export const fcmService = new FCMService();

