// firebase-messaging-sw.js - VERSION SIMPLIFIÉE ET FONCTIONNELLE
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// CONFIGURATION FIREBASE - MÊME QUE VOTRE APP
const firebaseConfig = {
  apiKey: "AIzaSyBn7VIddclO7KtrXb5sibCr9SjVLjOy-qI",
  authDomain: "theo1d.firebaseapp.com",
  projectId: "theo1d",
  storageBucket: "theo1d.firebasestorage.app",
  messagingSenderId: "269629842962",
  appId: "1:269629842962:web:a80a12b04448fe1e595acb",
  measurementId: "G-TNSG1XFMDZ"
};

// IMPORTANT: Initialiser Firebase IMMÉDIATEMENT
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('🔥 Firebase Messaging SW initialisé - Prêt pour notifications arrière-plan');

// ==============================================
// GESTIONNAIRE PRINCIPAL DES NOTIFICATIONS PUSH
// ==============================================

// 1. ÉCOUTER LES MESSAGES PUSH EN ARRIÈRE-PLAN
messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase SW] 📱 Message reçu en arrière-plan:', payload);
  
  // OPTION 1: Si le payload contient une notification pré-configurée
  if (payload.notification) {
    const notificationTitle = payload.notification.title || 'CS La Colombe';
    const notificationOptions = {
      body: payload.notification.body || 'Nouvelle notification',
      icon: './icon-192x192.png',
      badge: './icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'cs-push',
      renotify: true,
      requireInteraction: false,
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
      ]
    };
    
    // AFFICHER LA NOTIFICATION
    return self.registration.showNotification(notificationTitle, notificationOptions);
  }
  
  // OPTION 2: Si le payload contient des données custom
  if (payload.data) {
    const title = payload.data.title || 'CS La Colombe';
    const body = payload.data.body || 'Nouvelle mise à jour';
    const type = payload.data.type || 'general';
    
    const notificationOptions = {
      body: body,
      icon: './icon-192x192.png',
      badge: './icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: `push-${type}-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      silent: false,
      data: payload.data,
      actions: [
        {
          action: 'view',
          title: '👁️ Voir'
        }
      ]
    };
    
    return self.registration.showNotification(title, notificationOptions);
  }
  
  // OPTION 3: Notification par défaut
  return self.registration.showNotification('CS La Colombe', {
    body: 'Nouvelle notification disponible',
    icon: './icon-192x192.png',
    badge: './icon-72x72.png',
    tag: 'default-push',
    data: { type: 'default' }
  });
});

// ==============================================
// 2. GESTION DU CLIC SUR LES NOTIFICATIONS
// ==============================================
self.addEventListener('notificationclick', (event) => {
  console.log('🔘 Notification cliquée:', event.notification.data);
  
  // Fermer la notification
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action || 'view';
  
  if (action === 'dismiss') {
    return;
  }
  
  // OUVRIR L'APPLICATION OU LA PAGE APPROPRIÉE
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // 1. Chercher une fenêtre déjà ouverte
      for (const client of clientList) {
        if (client.url.includes('/index.html') && 'focus' in client) {
          client.focus();
          
          // Envoyer les données de la notification
          if (data.type) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: data,
              timestamp: Date.now()
            });
          }
          
          return;
        }
      }
      
      // 2. Ouvrir une nouvelle fenêtre si aucune n'est ouverte
      const urlToOpen = data.page ? `./index.html?page=${data.page}` : './index.html';
      
      return clients.openWindow(urlToOpen)
        .then((newClient) => {
          if (newClient && data.type) {
            // Attendre que la page charge
            setTimeout(() => {
              newClient.postMessage({
                type: 'NOTIFICATION_CLICK',
                data: data,
                timestamp: Date.now()
              });
            }, 1000);
          }
        });
    })
  );
});

// ==============================================
// 3. INSTALLATION ET ACTIVATION DU SERVICE WORKER
// ==============================================

self.addEventListener('install', (event) => {
  console.log('⚡ [Firebase SW] Installation');
  
  // FORCER l'activation immédiate
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('🚀 [Firebase SW] Activation - Prêt pour notifications');
  
  // PRENDRE LE CONTRÔLE IMMÉDIATEMENT
  event.waitUntil(self.clients.claim());
});

// ==============================================
// 4. SYNCHRONISATION EN ARRIÈRE-PLAN
// ==============================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'firebase-background-sync') {
    console.log('🔄 Firebase sync déclenché');
    
    // Vous pouvez ajouter ici la logique de sync
    // Par exemple: vérifier les nouvelles données
  }
});

// ==============================================
// 5. GESTION DES MESSAGES (OPTIONNEL)
// ==============================================

self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  if (type === 'PING') {
    console.log('🏓 Pong - Firebase SW actif');
    event.ports[0]?.postMessage({ type: 'PONG', timestamp: Date.now() });
  }
  
  if (type === 'TEST_NOTIFICATION') {
    console.log('🧪 Test notification demandé');
    
    self.registration.showNotification('✅ Test réussi', {
      body: 'Le Service Worker Firebase fonctionne !',
      icon: './icon-192x192.png',
      tag: 'test-notification'
    });
  }
});

console.log('✅ Firebase Messaging Service Worker COMPLÈTEMENT chargé');
