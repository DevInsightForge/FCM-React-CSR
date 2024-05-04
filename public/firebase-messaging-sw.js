/* global firebase */
self.importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js"
);
self.importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js"
);

self.firebaseConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

// Set Firebase configuration, once available
self.addEventListener("fetch", () => {
  try {
    const urlParams = new URLSearchParams(self.location.search);
    self.firebaseConfig = Object.fromEntries(urlParams);
  } catch (err) {
    console.error("Failed to add event listener", err);
  }
});

try {
  firebase.initializeApp(self.firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(({ notification, collapseKey, data }) => {
  console.log("Received background message: ", notification);

  const notificationTitle = notification.title;
  const notificationOptions = {
    body: notification.body,
    icon: notification.image,
    tag: collapseKey,
    data: data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Android needs explicit close.
  const actionPathname = event?.notification?.data?.action_pathname || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const existingClient = windowClients.find((client) => {
          const clientPathname = new URL(client.url).pathname;
          return clientPathname === actionPathname;
        });

        if (existingClient) {
          return existingClient.focus();
        } else if (self.clients.openWindow) {
          return self.clients.openWindow(actionPathname);
        }
      })
  );
});
