// sw-background.js - Service Worker OPTIMISÉ pour notifications arrière-plan
const CACHE_NAME = 'cs-lacolombe-background-2.5.0';
const APP_VERSION = '2.5.0';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Fichiers essentiels à mettre en cache
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-72x72.png',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// === 1. INSTALLATION ULTRA-RAPIDE ===
self.addEventListener('install', (event) => {
  console.log('⚡ [SW] Installation v' + APP_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Prendre contrôle IMMÉDIATEMENT
      self.skipWaiting(),
      
      // Mettre en cache les fichiers essentiels
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ESSENTIAL_FILES))
        .then(() => console.log('✅ Fichiers essentiels mis en cache'))
    ])
  );
});

// === 2. ACTIVATION INSTANTANÉE ===
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW] Activation - PRISE DE CONTRÔLE');
  
  event.waitUntil(
    Promise.all([
      // Prendre contrôle de TOUS les clients
      self.clients.claim(),
      
      // Nettoyer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Démarrer le système de notifications
      initializeBackgroundSystem()
    ]).then(() => {
      console.log('✅ SW activé et prêt pour notifications arrière-plan');
    })
  );
});

// === 3. INITIALISATION DU SYSTÈME ARRIÈRE-PLAN ===
async function initializeBackgroundSystem() {
  console.log('🔔 Initialisation notifications arrière-plan...');
  
  try {
    // Initialiser Firebase pour notifications
    await initializeFirebase();
    
    // Programmer des vérifications périodiques
    startPeriodicChecks();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    // Première vérification
    setTimeout(() => checkForNewData(), 10000);
    
    console.log('✅ Système arrière-plan initialisé');
    
  } catch (error) {
    console.error('❌ Erreur initialisation arrière-plan:', error);
  }
}

// === 4. INITIALISATION FIREBASE ===
async function initializeFirebase() {
  console.log('🔥 Initialisation Firebase...');
  
  try {
    // Importer Firebase dynamiquement
    importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');
    
    // Configuration Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyBn7VIddclO7KtrXb5sibCr9SjVLjOy-qI",
      authDomain: "theo1d.firebaseapp.com",
      projectId: "theo1d",
      storageBucket: "theo1d.firebasestorage.app",
      messagingSenderId: "269629842962",
      appId: "1:269629842962:web:a80a12b04448fe1e595acb"
    };
    
    // Initialiser Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    console.log('✅ Firebase initialisé dans SW');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur Firebase:', error);
    return false;
  }
}

// === 5. DÉMARRER VÉRIFICATIONS PÉRIODIQUES ===
function startPeriodicChecks() {
  console.log('⏰ Démarrage vérifications périodiques...');
  
  // Vérifier toutes les 5 minutes
  setInterval(() => {
    if (navigator.onLine) {
      checkForNewData();
    }
  }, SYNC_INTERVAL);
  
  // Vérifier quand on revient en ligne
  self.addEventListener('online', () => {
    console.log('🌐 En ligne - Vérification immédiate');
    checkForNewData();
  });
}

// === 6. CONFIGURER ÉCOUTEURS D'ÉVÉNEMENTS ===
function setupEventListeners() {
  console.log('👂 Configuration écouteurs...');
  
  // Écouter les messages push Firebase
  self.addEventListener('push', handlePushEvent);
  
  // Écouter les clics sur les notifications
  self.addEventListener('notificationclick', handleNotificationClick);
  
  // Écouter la synchronisation arrière-plan
  self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
      console.log('🔄 Synchronisation arrière-plan déclenchée');
      event.waitUntil(checkForNewData());
    }
  });
  
  // Écouter les messages des clients
  self.addEventListener('message', handleClientMessage);
}

// === 7. GESTIONNAIRE PUSH EVENT ===
function handlePushEvent(event) {
  console.log('📨 Événement push reçu:', event);
  
  let payload;
  
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = {
      notification: {
        title: 'CS La Colombe',
        body: 'Nouvelle notification disponible',
        icon: '/icon-192x192.png'
      }
    };
  }
  
  console.log('📦 Données push:', payload);
  
  const notificationTitle = payload.notification?.title || 'CS La Colombe';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle mise à jour disponible',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'push-notification',
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: '👁️ Voir'
      },
      {
        action: 'dismiss',
        title: '❌ Fermer'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('✅ Notification affichée en arrière-plan');
        
        // Mettre à jour le badge
        updateBadgeCount(1);
      })
      .catch(error => {
        console.error('❌ Erreur affichage notification:', error);
      })
  );
}

// === 8. VÉRIFIER NOUVELLES DONNÉES ===
async function checkForNewData() {
  console.log('🔍 Vérification nouvelles données...');
  
  try {
    // Récupérer les données parent depuis le stockage
    const parentData = await getParentData();
    
    if (!parentData) {
      console.log('⚠️ Aucune donnée parent disponible');
      return;
    }
    
    console.log(`👤 Parent trouvé: ${parentData.fullName}`);
    
    // Simuler la vérification de différentes données
    await Promise.all([
      checkNewGrades(parentData),
      checkNewIncidents(parentData),
      checkNewHomework(parentData),
      checkNewPresences(parentData)
    ]);
    
    // Mettre à jour le timestamp
    updateLastCheckTime();
    
  } catch (error) {
    console.error('❌ Erreur vérification données:', error);
  }
}

// === 9. VÉRIFIER NOUVELLES NOTES ===
async function checkNewGrades(parentData) {
  if (!parentData.children || parentData.children.length === 0) return;
  
  console.log('📊 Vérification nouvelles notes...');
  
  // Simulation - Dans la réalité, vous feriez une requête Firestore
  const hasNewGrades = Math.random() > 0.7;
  
  if (hasNewGrades) {
    parentData.children.forEach(child => {
      showNotification({
        title: '📊 Nouvelle note publiée',
        body: `${child.fullName} a une nouvelle note disponible`,
        data: {
          type: 'grades',
          page: 'grades',
          childId: child.matricule,
          childName: child.fullName,
          timestamp: new Date().toISOString()
        }
      });
    });
  }
}

// === 10. VÉRIFIER NOUVEAUX INCIDENTS ===
async function checkNewIncidents(parentData) {
  if (!parentData.children || parentData.children.length === 0) return;
  
  console.log('⚠️ Vérification nouveaux incidents...');
  
  const hasNewIncidents = Math.random() > 0.8;
  
  if (hasNewIncidents) {
    parentData.children.forEach(child => {
      showNotification({
        title: '⚠️ Nouvel incident signalé',
        body: `Un incident a été signalé pour ${child.fullName}`,
        data: {
          type: 'incidents',
          page: 'presence-incidents',
          childId: child.matricule,
          childName: child.fullName,
          timestamp: new Date().toISOString()
        }
      });
    });
  }
}

// === 11. AFFICHER NOTIFICATION ===
function showNotification(notificationData) {
  console.log('📨 Création notification:', notificationData.title);
  
  const options = {
    body: notificationData.body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: `notification-${Date.now()}`,
    renotify: false,
    requireInteraction: true,
    silent: false,
    data: notificationData.data || {},
    actions: [
      { action: 'open', title: '👁️ Voir' },
      { action: 'dismiss', title: '❌ Fermer' }
    ]
  };
  
  return self.registration.showNotification(notificationData.title, options)
    .then(() => {
      console.log('✅ Notification créée');
      updateBadgeCount(1);
    })
    .catch(error => {
      console.error('❌ Erreur création notification:', error);
    });
}

// === 12. GESTIONNAIRE CLIC NOTIFICATION ===
function handleNotificationClick(event) {
  console.log('🔘 Notification cliquée:', event.notification.data);
  
  event.notification.close();
  
  const data = event.notification.data;
  const action = event.action;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Ouvrir/activer l'application
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Chercher un onglet déjà ouvert
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          
          // Envoyer les données de la notification
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: data
          });
          
          return;
        }
      }
      
      // Ouvrir une nouvelle fenêtre
      return clients.openWindow('/').then((newClient) => {
        if (newClient) {
          // Donner le temps de charger
          setTimeout(() => {
            newClient.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data
            });
          }, 1000);
        }
      });
    })
  );
}

// === 13. GESTIONNAIRE MESSAGES CLIENTS ===
function handleClientMessage(event) {
  const { type, data } = event.data || {};
  
  console.log('📨 Message client reçu:', type);
  
  switch (type) {
    case 'SAVE_PARENT_DATA':
      console.log('💾 Sauvegarde données parent');
      saveParentData(data).then(() => {
        event.ports?.[0]?.postMessage({ success: true });
      });
      break;
      
    case 'CHECK_NOW':
      console.log('🔔 Vérification immédiate demandée');
      checkForNewData();
      event.ports?.[0]?.postMessage({ checking: true });
      break;
      
    case 'GET_STATUS':
      event.ports?.[0]?.postMessage({
        status: 'active',
        version: APP_VERSION,
        lastCheck: getLastCheckTime(),
        parentData: getParentDataSync()
      });
      break;
      
    case 'TEST_NOTIFICATION':
      showNotification({
        title: '✅ Test notification',
        body: 'Les notifications arrière-plan fonctionnent !',
        data: { type: 'test', page: 'dashboard' }
      });
      event.ports?.[0]?.postMessage({ sent: true });
      break;
  }
}

// === 14. FONCTIONS UTILITAIRES ===

async function getParentData() {
  return new Promise((resolve) => {
    // Essayer IndexedDB
    const request = indexedDB.open('ParentBackgroundDB', 1);
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['parent'], 'readonly');
      const store = transaction.objectStore('parent');
      const getRequest = store.get('current');
      
      getRequest.onsuccess = function() {
        resolve(getRequest.result || null);
      };
      
      getRequest.onerror = function() {
        resolve(null);
      };
    };
    
    request.onerror = function() {
      resolve(null);
    };
  });
}

async function saveParentData(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ParentBackgroundDB', 1);
    
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('parent')) {
        db.createObjectStore('parent', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['parent'], 'readwrite');
      const store = transaction.objectStore('parent');
      
      store.put({
        id: 'current',
        ...data,
        savedAt: new Date().toISOString()
      });
      
      transaction.oncomplete = function() {
        console.log('💾 Données parent sauvegardées');
        resolve();
      };
      
      transaction.onerror = function(event) {
        reject(event.target.error);
      };
    };
    
    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

function getParentDataSync() {
  try {
    const data = localStorage.getItem('parent_backup_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

function updateBadgeCount(increment = 1) {
  let count = parseInt(localStorage.getItem('notification_count') || '0');
  count += increment;
  localStorage.setItem('notification_count', count.toString());
  
  // Mettre à jour le badge PWA
  if ('setAppBadge' in navigator) {
    navigator.setAppBadge(count).catch(console.error);
  }
}

function getLastCheckTime() {
  return localStorage.getItem('last_background_check') || 'Jamais';
}

function updateLastCheckTime() {
  localStorage.setItem('last_background_check', new Date().toISOString());
}

// === 15. GESTION REQUÊTES FETCH ===
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Ignorer les requêtes Firebase
  if (request.url.includes('firebase') || 
      request.url.includes('fcm') ||
      request.url.includes('googleapis.com/fcm')) {
    return;
  }
  
  // Stratégie cache-first pour les ressources
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then(response => {
            // Mettre en cache si succès
            if (response.ok && request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Fallback pour les pages
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('Service hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// === 16. FONCTIONS SIMULATION POUR VÉRIFICATION ===
async function checkNewHomework(parentData) {
  if (!parentData.children) return;
  
  const hasNewHomework = Math.random() > 0.6;
  
  if (hasNewHomework) {
    parentData.children.forEach(child => {
      if (child.type === 'secondary' || child.type === 'primary') {
        showNotification({
          title: '📚 Nouveau devoir',
          body: `${child.fullName} a un nouveau devoir à faire`,
          data: {
            type: 'homework',
            page: 'homework',
            childId: child.matricule,
            childName: child.fullName
          }
        });
      }
    });
  }
}

async function checkNewPresences(parentData) {
  if (!parentData.children) return;
  
  const hasNewPresence = Math.random() > 0.5;
  
  if (hasNewPresence) {
    parentData.children.forEach(child => {
      showNotification({
        title: '📅 Mise à jour présence',
        body: `La présence de ${child.fullName} a été mise à jour`,
        data: {
          type: 'presence',
          page: 'presence-incidents',
          childId: child.matricule,
          childName: child.fullName
        }
      });
    });
  }
}

console.log('✅ Service Worker Background chargé - Version ' + APP_VERSION);
