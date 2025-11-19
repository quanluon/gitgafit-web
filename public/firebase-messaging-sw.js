/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Constants
const FCM_CONFIG_KEY = 'firebase-config';
const DEFAULT_ICON = '/icons/icon-192x192.png';

let firebaseApp = null;
let messaging = null;

// Initialize Firebase with config from IndexedDB or message
function initializeFirebase(config) {
  if (!config) {
    console.warn('[FCM SW] No firebase config available');
    return false;
  }

  try {
    if (!firebaseApp) {
      firebaseApp = firebase.initializeApp({
        apiKey: 'AIzaSyC8_2OdgQcuJn7nBOffaDnq937cvrZGOkI',
        authDomain: 'gigafit-e5df3.firebaseapp.com',
        projectId: 'gigafit-e5df3',
        storageBucket: 'gigafit-e5df3.firebasestorage.app',
        messagingSenderId: '228631832664',
        appId: '1:228631832664:web:f428e3e046d4678f59422d',
        measurementId: 'G-Q84X4TDHTJ',
      });
      console.log('[FCM SW] Firebase app initialized');
    }

    if (!messaging) {
      messaging = firebase.messaging();
      setupBackgroundMessageHandler();
      console.log('[FCM SW] Messaging initialized');
    }

    return true;
  } catch (error) {
    console.error('[FCM SW] Failed to initialize Firebase:', error);
    return false;
  }
}

// Setup background message handler
function setupBackgroundMessageHandler() {
  if (!messaging) return;

  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Background message received:', payload);

    const { notification, data } = payload || {};

    // Extract notification data
    const title = notification?.title || data?.title || 'GigaFit';
    const body = notification?.body || data?.body || '';
    const icon = notification?.icon || DEFAULT_ICON;

    // Show notification
    return self.registration.showNotification(title, {
      body,
      icon,
      data: data || {},
      tag: data?.jobId || data?.generationType || undefined,
      badge: DEFAULT_ICON,
      vibrate: [200, 100, 200],
    });
  });
}

// IndexedDB helpers for config persistence
async function saveConfig(config) {
  try {
    const db = await openDB();
    const tx = db.transaction('config', 'readwrite');
    const store = tx.objectStore('config');
    await store.put(config, FCM_CONFIG_KEY);
    console.log('[FCM SW] Config saved to IndexedDB');
  } catch (error) {
    console.warn('[FCM SW] Failed to save config:', error);
  }
}

async function loadConfig() {
  try {
    const db = await openDB();
    const tx = db.transaction('config', 'readonly');
    const store = tx.objectStore('config');
    const config = await store.get(FCM_CONFIG_KEY);
    if (config) {
      console.log('[FCM SW] Config loaded from IndexedDB');
    }
    return config;
  } catch (error) {
    console.warn('[FCM SW] Failed to load config:', error);
    return null;
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gigafit-fcm-sw', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Service Worker Lifecycle Events
self.addEventListener('install', (event) => {
  console.log('[FCM SW] Installing...');
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  console.log('[FCM SW] Activating...');
  event.waitUntil(
    (async () => {
      // Claim clients first
      await self.clients.claim();
      console.log('[FCM SW] Activated and claimed clients');

      // Try to load config and initialize Firebase on activation
      try {
        const config = await loadConfig();
        if (config) {
          initializeFirebase(config);
          console.log('[FCM SW] Firebase initialized from stored config');
        } else {
          console.log('[FCM SW] No stored config found, waiting for config from app');
        }
      } catch (error) {
        console.warn('[FCM SW] Failed to load config on activation:', error);
      }
    })(),
  );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  const { data } = event;

  if (data?.type === 'FIREBASE_CONFIG') {
    console.log('[FCM SW] Received Firebase config from app');
    const config = data.payload;

    // Initialize Firebase with the received config
    if (initializeFirebase(config)) {
      // Save config for future use (persist to IndexedDB)
      event.waitUntil(
        saveConfig(config).then(() => {
          console.log('[FCM SW] Config saved and Firebase initialized');
        }),
      );
    } else {
      console.warn('[FCM SW] Failed to initialize Firebase with received config');
    }
  }
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('[FCM SW] Push event received');

  event.waitUntil(
    (async () => {
      try {
        // Ensure Firebase is initialized before handling push
        if (!messaging || !firebaseApp) {
          console.log('[FCM SW] Firebase not initialized, loading config...');
          const config = await loadConfig();
          if (config) {
            const initialized = initializeFirebase(config);
            if (!initialized) {
              console.error('[FCM SW] Failed to initialize Firebase for push event');
              return;
            }
          } else {
            console.warn('[FCM SW] No config available for push event - cannot process push');
            return;
          }
        }

        // Firebase Messaging will handle the rest via onBackgroundMessage
        // The push payload will be automatically processed by onBackgroundMessage
        console.log('[FCM SW] Firebase ready, waiting for onBackgroundMessage to process');
      } catch (error) {
        console.error('[FCM SW] Error handling push:', error);
      }
    })(),
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked:', event.notification);

  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            // Send message to the existing window
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              payload: data,
            });
            return client.focus();
          }
        }

        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
      .catch((error) => {
        console.error('[FCM SW] Error handling notification click:', error);
      }),
  );
});

// Initialize config loading on service worker startup
// This runs immediately when the script loads, before activate event
(async () => {
  try {
    const config = await loadConfig();
    if (config) {
      initializeFirebase(config);
      console.log('[FCM SW] Firebase initialized from stored config on startup');
    } else {
      console.log('[FCM SW] No stored config found on startup, will wait for config from app');
    }
  } catch (error) {
    console.warn('[FCM SW] Failed to load config on startup:', error);
  }
})();

console.log('[FCM SW] Service worker script loaded');
