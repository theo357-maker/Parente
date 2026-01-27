// Créer un nouveau fichier : firebase-sw-immediate.js
// service-worker spécifique pour les notifications

self.addEventListener('install', (event) => {
  console.log('🔥 Installation Firebase SW - PRIORITÉ MAX');
  self.skipWaiting(); // FORCER l'activation immédiate
});

self.addEventListener('activate', (event) => {
  console.log('🔥 Activation Firebase SW - PRISE DE CONTRÔLE');
  event.waitUntil(self.clients.claim());
});

// Initialiser Firebase IMMÉDIATEMENT
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBn7VIddclO7KtrXb5sibCr9SjVLjOy-qI",
  authDomain: "theo1d.firebaseapp.com",
  projectId: "theo1d",
  storageBucket: "theo1d.firebasestorage.app",
  messagingSenderId: "269629842962",
  appId: "1:269629842962:web:a80a12b04448fe1e595acb"
};

try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialisé IMMÉDIATEMENT');
  
  const messaging = firebase.messaging();
  
  // ÉCOUTER les messages PUSH IMMÉDIATEMENT
  self.addEventListener('push', (event) => {
    console.log('🚨 Push reçu IMMÉDIATEMENT:', event);
    
    // Ne pas attendre - traiter immédiatement
    event.waitUntil(handlePushImmediately(event));
  });
  
} catch (error) {
  console.error('❌ Erreur Firebase:', error);
});

async function handlePushImmediately(event) {
  const payload = event.data ? event.data.json() : {
    notification: {
      title: 'CS La Colombe',
      body: 'Nouvelle notification',
      icon: '/icon-192x192.png'
    }
  };
  
  // Afficher la notification IMMÉDIATEMENT
  await self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: payload.notification.icon || '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: 'immediate-notification',
      data: payload.data || {}
    }
  );
  
  // Mettre à jour le badge
  if ('setAppBadge' in navigator) {
    navigator.setAppBadge().catch(console.error);
  }
}
