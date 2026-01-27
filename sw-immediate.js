// sw-immediate.js - Version ultra-rapide
const CACHE_NAME = 'cs-lacolombe-immediate-v1';
const VERSION = '2.3.1-immediate';

// INSTALLATION ULTRA-RAPIDE
self.addEventListener('install', (event) => {
  console.log('⚡ Installation IMMÉDIATE');
  
  event.waitUntil(
    Promise.all([
      // Prendre contrôle immédiatement
      self.skipWaiting(),
      
      // Mise en cache ESSENTIEL seulement
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/icon-192x192.png'
        ]);
      })
    ]).then(() => {
      console.log('✅ Installation complète - PRÊT');
      // Signaler qu'on est prêt
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'READY' });
        });
      });
    })
  );
});

// ACTIVATION INSTANTANÉE
self.addEventListener('activate', (event) => {
  console.log('🚀 Activation IMMÉDIATE');
  
  event.waitUntil(
    Promise.all([
      // Prendre contrôle de TOUS les clients
      self.clients.claim(),
      
      // Démarrer IMMÉDIATEMENT les listeners
      startImmediateListeners()
    ]).then(() => {
      console.log('✅ Activation complète - ÉCOUTE ACTIVE');
    })
  );
});

// DÉMARRER LES ÉCOUTEURS IMMÉDIATEMENT
function startImmediateListeners() {
  console.log('👂 Démarrage écouteurs...');
  
  // 1. Push IMMÉDIAT
  self.addEventListener('push', (event) => {
    console.log('📨 Push reçu:', event);
    
    const payload = event.data ? event.data.json() : {
      title: 'CS La Colombe',
      body: 'Notification',
      icon: '/icon-192x192.png'
    };
    
    // AFFICHER IMMÉDIATEMENT (sans délai)
    event.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        badge: '/icon-72x72.png',
        vibrate: [100, 50, 100],
        tag: 'push-' + Date.now(),
        requireInteraction: false,
        silent: false,
        data: payload.data || {}
      }).then(() => {
        console.log('✅ Notification affichée IMMÉDIATEMENT');
      })
    );
  });
  
  // 2. Background Sync optimisé
  self.addEventListener('sync', (event) => {
    if (event.tag === 'immediate-sync') {
      console.log('🔄 Sync immédiat');
      event.waitUntil(checkForUpdatesImmediately());
    }
  });
  
  // 3. Message des clients
  self.addEventListener('message', (event) => {
    if (event.data.type === 'PING') {
      console.log('🏓 Pong - Service Worker actif');
      event.ports[0]?.postMessage({ type: 'PONG' });
    }
    
    if (event.data.type === 'ACTIVATE_NOW') {
      console.log('⚡ Activation demandée');
      self.clients.claim();
    }
  });
  
  return Promise.resolve();
}

// VÉRIFICATION ULTRA-RAPIDE
async function checkForUpdatesImmediately() {
  console.log('🔍 Vérification IMMÉDIATE');
  
  // Vérifier simple et rapide
  try {
    // 1. Vérifier le cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match('/');
    
    // 2. Signaler qu'on est actif
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'BACKGROUND_ACTIVE',
          timestamp: Date.now()
        });
      });
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
    return false;
  }
}

// FETCH minimal
self.addEventListener('fetch', (event) => {
  // Pour les notifications, retourner immédiatement
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('fcm')) {
    return;
  }
  
  // Cache-first pour le reste
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
