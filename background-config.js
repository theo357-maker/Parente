// background-config.js - Configuration des notifications arrière-plan
const BackgroundNotificationConfig = {
  // Fréquence de vérification (en millisecondes)
  checkIntervals: {
    grades: 5 * 60 * 1000,      // 5 minutes
    incidents: 10 * 60 * 1000,   // 10 minutes
    homework: 15 * 60 * 1000,    // 15 minutes
    presences: 30 * 60 * 1000,   // 30 minutes
    communiques: 60 * 60 * 1000  // 60 minutes
  },
  
  // Priorités des notifications
  priorities: {
    grades: 'high',
    incidents: 'high',
    homework: 'normal',
    presences: 'normal',
    communiques: 'normal'
  },
  
  // Options de vibration
  vibrationPatterns: {
    high: [200, 100, 200, 100, 200],
    normal: [200, 100, 200],
    low: [200]
  },
  
  // Configuration Firebase
  firebase: {
    config: {
      apiKey: "AIzaSyBn7VIddclO7KtrXb5sibCr9SjVLjOy-qI",
      authDomain: "theo1d.firebaseapp.com",
      projectId: "theo1d",
      storageBucket: "theo1d.firebasestorage.app",
      messagingSenderId: "269629842962",
      appId: "1:269629842962:web:a80a12b04448fe1e595acb"
    },
    vapidKey: "BFc44CIL4VykUiY8_17s_HbUm5pRqhNhlFcy35H0XKuyFIq-2472MTfMZBfKMxW81DCHTkRB4xy_WaH-f3Ik2TM"
  },
  
  // Stockage
  storageKeys: {
    parentData: 'parent_background_data',
    lastChecks: 'background_last_checks',
    notificationCount: 'background_notification_count'
  },
  
  // URLs des API
  apiEndpoints: {
    checkGrades: '/api/check-grades',
    checkIncidents: '/api/check-incidents',
    checkHomework: '/api/check-homework',
    checkPresences: '/api/check-presences',
    checkCommuniques: '/api/check-communiques'
  },
  
  // Options de réessai
  retry: {
    maxAttempts: 3,
    delay: 5000, // 5 secondes
    backoff: true
  }
};

// Exporter la configuration
window.BackgroundNotificationConfig = BackgroundNotificationConfig;
