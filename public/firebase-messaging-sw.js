// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// This file is generated at build/dev time. Do not edit directly.
// Values are injected from environment variables by scripts/generate-firebase-sw.js
const firebaseConfig = {
  apiKey: "AIzaSyAxUoLbXyetnHTjjbKur1zT0S24M3rX8Iw",
  authDomain: "inhouse-5d53f.firebaseapp.com",
  projectId: "inhouse-5d53f",
  storageBucket: "inhouse-5d53f.firebasestorage.app",
  messagingSenderId: "1054020423603",
  appId: "1:1054020423603:web:a10244ffbf5339494e85c6",
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  
  const { title, body, icon } = payload.notification || {};
  const { type, senderId, pingId } = payload.data || {};
  
  // Customize the notification here
  const notificationTitle = title || 'New Ping!';
  const notificationOptions = {
    body: body || 'You have received a new ping request',
    icon: icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      type,
      senderId,
      pingId,
      url: '/directory' // Where to navigate when clicked
    },
    actions: [
      {
        action: 'accept',
        title: 'Accept'
      },
      {
        action: 'reject', 
        title: 'Reject'
      },
      {
        action: 'view',
        title: 'View'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const { action, data } = event;
  const { url, type, pingId } = data || {};
  
  if (action === 'accept' || action === 'reject') {
    // Handle ping response
    event.waitUntil(
      fetch(`/api/ping/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pingId,
          action: action.toUpperCase()
        })
      })
    );
  }
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // If the app is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If the app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(url || '/');
      }
    })
  );
});


