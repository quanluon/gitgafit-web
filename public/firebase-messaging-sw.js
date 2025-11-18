/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

let firebaseAppInstance = null;
let messagingInstance = null;
let cachedConfig = null;
let persistedConfigPromise = null;

const FCM_STORAGE = Object.freeze({
  dbName: 'gigafit-fcm-sw',
  storeName: 'firebase-config',
  configKey: 'firebase-config',
  version: 1,
});
const {
  dbName: FCM_DB_NAME,
  storeName: FCM_STORE_NAME,
  configKey: FCM_CONFIG_KEY,
  version: FCM_DB_VERSION,
} = FCM_STORAGE;

const isIndexedDBAvailable = typeof indexedDB !== 'undefined';

const configDbPromise = isIndexedDBAvailable
  ? new Promise((resolve, reject) => {
      const request = indexedDB.open(FCM_DB_NAME, FCM_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(FCM_STORE_NAME)) {
          db.createObjectStore(FCM_STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    })
  : null;

const withConfigStore = async (mode, handler) => {
  if (!configDbPromise) return null;

  try {
    const db = await configDbPromise;
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(FCM_STORE_NAME, mode);
      const store = transaction.objectStore(FCM_STORE_NAME);
      const request = handler(store);

      if (!request) {
        resolve(null);
        return;
      }

      transaction.oncomplete = () => resolve(request.result ?? null);
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('[FCM SW] IndexedDB transaction failed:', error);
    return null;
  }
};

const persistFirebaseConfig = async (config) => {
  if (!config) return null;

  return withConfigStore('readwrite', (store) =>
    store.put(config, FCM_CONFIG_KEY),
  ).catch((error) => {
    console.warn('[FCM SW] Failed to persist config:', error);
    return null;
  });
};

const readPersistedFirebaseConfig = async () =>
  withConfigStore('readonly', (store) => store.get(FCM_CONFIG_KEY));

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
        const {
          notification: notificationPayload = {},
          data = {},
        } = payload;
        const {
          title: notificationTitle,
          body: notificationBody,
          icon: notificationIcon,
        } = notificationPayload;
        const {
          title: dataTitle,
          body: dataBody,
          jobId,
          generationType,
        } = data;

        const title = notificationTitle || dataTitle || 'GigaFit';
        const body = notificationBody || dataBody || '';

        self.registration.showNotification(title, {
          body,
          icon: notificationIcon || DEFAULT_ICON,
          data,
          tag: jobId || generationType || undefined,
        });
      });
    } catch (error) {
      console.error('[FCM SW] Failed to initialize messaging:', error);
      messagingInstance = null;
    }
  }

  return messagingInstance;
};

const hydrateConfigFromStorage = () => {
  if (!persistedConfigPromise) {
    persistedConfigPromise = readPersistedFirebaseConfig()
      .then((storedConfig) => {
        if (storedConfig && !cachedConfig) {
          cachedConfig = storedConfig;
          ensureMessaging(cachedConfig);
        }
        return storedConfig;
      })
      .catch((error) => {
        console.warn('[FCM SW] Failed to read persisted config:', error);
        return null;
      });
  }
  return persistedConfigPromise;
};

hydrateConfigFromStorage();

self.addEventListener('install', ({ waitUntil }) => {
  self.skipWaiting();
  waitUntil(Promise.resolve());
});

self.addEventListener('activate', ({ waitUntil }) => {
  waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const { data } = event;
  if (!data?.type) return;

  if (data.type === 'FIREBASE_CONFIG') {
    cachedConfig = data.payload;
    ensureMessaging(cachedConfig);
    event.waitUntil(
      persistFirebaseConfig(cachedConfig),
    );
  }
});

self.addEventListener('push', ({ waitUntil }) => {
  waitUntil(
    (async () => {
      if (!cachedConfig) {
        cachedConfig = (await hydrateConfigFromStorage()) || null;
      }
      if (!messagingInstance && cachedConfig) {
        ensureMessaging(cachedConfig);
      }
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  const { notification } = event;
  notification.close();

  const destination = notification?.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'GENERATION_NOTIFICATION_CLICK',
            payload: notification.data,
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
