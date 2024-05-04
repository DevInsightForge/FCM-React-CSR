import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const firebaseMessaging = getMessaging(firebaseApp);

export const getOrRegisterServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    const serviceWorker = await window.navigator.serviceWorker.getRegistration(
      "/firebase-push-notification-scope"
    );
    if (serviceWorker) return serviceWorker;

    const configParams = new URLSearchParams(firebaseConfig);
    return window.navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${configParams.toString()}`,
      {
        scope: "/firebase-push-notification-scope",
      }
    );
  }
  throw new Error("The browser doesn`t support service worker.");
};

export const getFirebaseToken = async () => {
  const serviceWorkerRegistration = await getOrRegisterServiceWorker();
  while (!serviceWorkerRegistration?.active)
    await new Promise((resolve) => setTimeout(resolve, 1000));

  return getToken(firebaseMessaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });
};

export const onForegroundMessage = () =>
  new Promise((resolve) =>
    onMessage(firebaseMessaging, (payload) => resolve(payload))
  );
