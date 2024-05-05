/* global firebase */
self.importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js"
);
self.importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js"
);

self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Android needs explicit close.
  const actionPathname =
    event?.notification?.data?.FCM_MSG?.data?.action_pathname || "/";

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

// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

// Initialize Firebase app
firebase.initializeApp(defaultConfig);
firebase.messaging();
