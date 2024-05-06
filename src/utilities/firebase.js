import { initializeApp } from "firebase/app";
import {
  deleteToken,
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

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
const serviceWorkerScope = "/firebase-push-notification-scope";

export const getOrRegisterServiceWorker = async () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    const serviceWorker = await window.navigator.serviceWorker.getRegistration(
      serviceWorkerScope
    );
    if (serviceWorker) return serviceWorker;

    return window.navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      {
        scope: serviceWorkerScope,
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

export const removeFirebaseServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations?.length < 1) return;

      deleteToken(firebaseMessaging);
      for (let registration of registrations) {
        await registration.unregister();
      }

      return true;
    } catch (error) {
      return false;
    }
  }
};

export const registerOnMessageCallback = (callbackFn = () => {}) => {
  onMessage(firebaseMessaging, callbackFn);
};
