// firebase-messaging-sw.js - NOUVELLE VERSION
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBn7VIddclO7KtrXb5sibCr9SjVLjOy-qI",
  authDomain: "theo1d.firebasestorage.app",
  projectId: "theo1d",
  storageBucket: "theo1d.firebasestorage.app",
  messagingSenderId: "269629842962",
  appId: "1:269629842962:web:a80a12b04448fe1e595acb",
  measurementId: "G-TNSG1XFMDZ"
};

// VAPID KEY POUR NOTIFICATIONS SYSTÈME
const vapidKey = "BFc44CIL4VykUiY8_17s_HbUm5pRqhNhlFcy35H0XKuyFIq-2472MTfMZBfKMxW81DCHTkRB4xy_WaH-f3Ik2TM";

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// CONFIGURATION ESSENTIELLE POUR NOTIFICATIONS SYSTÈME
messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase SW] 📱 Notification background:', payload);
  
  const notificationTitle = payload.notification?.title || 'CS La Colombe';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'fcm-push',
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: '👁️ Ouvrir'
      },
      {
        action: 'dismiss',
        title: '❌ Fermer'
      }
    ],
    // OPTIONS POUR NOTIFICATIONS SYSTÈME
    android: {
      channelId: 'high_importance_channel',
      priority: 'high',
      vibrate: [200, 100, 200]
    },
    // iOS
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          'content-available': 1
        }
      }
    },
    // Web
    webpush: {
      headers: {
        Urgency: 'high'
      }
    }
  };

  // AFFICHER LA NOTIFICATION SYSTÈME
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// GESTION DES CLICS SUR LES NOTIFICATIONS SYSTÈME
self.addEventListener('notificationclick', (event) => {
  console.log('🔘 Notification cliquée:', event.notification.data);
  
  event.notification.close();
  
  const data = event.notification.data;
  const action = event.action;
  
  if (action === 'dismiss') {
    return;
  }
  
  // OUVIR L'APPLICATION
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Chercher un onglet ouvert
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          
          // Envoyer des données
          client.postMessage({
            type: 'FCM_NOTIFICATION_CLICK',
            data: data
          });
          
          return;
        }
      }
      
      // Ouvrir une nouvelle fenêtre
      return clients.openWindow('/').then((newClient) => {
        if (newClient) {
          setTimeout(() => {
            newClient.postMessage({
              type: 'FCM_NOTIFICATION_CLICK',
              data: data
            });
          }, 1000);
        }
      });
    })
  );
});
