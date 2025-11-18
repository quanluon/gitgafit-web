/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

let firebaseAppInstance = null;
let messagingInstance = null;
let cachedConfig = null;

const DEFAULT_ICON = '/icons/icon-192x192.png';

const ensureMessaging = (config) => {
  if (!config) {
    console.warn('[FCM SW] Missing firebase config payload.');
    return null;
  }

  if (!firebaseAppInstance) {
    try {
      if (firebase.apps && firebase.apps.length > 0) {
        firebaseAppInstance = firebase.apps[0];
      } else {
        firebaseAppInstance = firebase.initializeApp(config);
      }
    } catch (error) {
      console.error('[FCM SW] Failed to initialize Firebase app:', error);
      return null;
    }
  }

  if (!messagingInstance) {
    try {
      messagingInstance = firebase.messaging();

      messagingInstance.onBackgroundMessage((payload) => {
        const title =
          payload.notification?.title ||
          payload.data?.title ||
          'GigaFit';
        const body =
          payload.notification?.body ||
          payload.data?.body ||
          '';

        self.registration.showNotification(title, {
          body,
          icon: payload.notification?.icon || DEFAULT_ICON,
          data: payload.data,
          tag: payload.data?.jobId || payload.data?.generationType || undefined,
        });
      });
    } catch (error) {
      console.error('[FCM SW] Failed to initialize messaging:', error);
      messagingInstance = null;
    }
  }

  return messagingInstance;
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  if (event.data.type === 'FIREBASE_CONFIG') {
    cachedConfig = event.data.payload;
    ensureMessaging(cachedConfig);
  }
});

self.addEventListener('push', () => {
  if (!messagingInstance && cachedConfig) {
    ensureMessaging(cachedConfig);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const destination = event.notification?.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'GENERATION_NOTIFICATION_CLICK',
            payload: event.notification.data,
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(destination);
      }
      return undefined;
    }),
  );
});
