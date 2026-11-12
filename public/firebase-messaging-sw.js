// public/firebase-messaging-sw.js
/**
 * Service Worker for Push Notifications
 * Supports background push, rich notification cards, and deep-link routing.
 */

// Service Worker Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Service Worker Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle custom push message from client or FCM
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      ...options,
      badge: '/logo.svg',
      icon: options.icon || '/logo.svg',
      vibrate: [200, 100, 200]
    });
  }
});

// Handle incoming Web Push (FCM standard payload)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Shusila Upvan Alert', message: event.data.text() };
    }
  }

  const title = data.notification?.title || data.title || 'Shusila Upvan Update';
  const body = data.notification?.body || data.body || data.message || 'You have a new update';
  const deepLink = data.data?.deepLink || data.deepLink || '/notifications';
  const imageUrl = data.notification?.image || data.imageUrl || null;

  const options = {
    body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    image: imageUrl,
    data: { deepLink, id: data.data?.id },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'View Details' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click to navigate deep-link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const deepLink = event.notification.data?.deepLink || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus and navigate it
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(deepLink);
          }
        }
      }
      // If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(deepLink);
      }
    })
  );
});

