import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB38VitK3yZoC4X6msEOe27m5mLj9EVDwU",
  authDomain: "servfixy-27a50.firebaseapp.com",
  projectId: "servfixy-27a50",
  storageBucket: "servfixy-27a50.firebasestorage.app",
  messagingSenderId: "154271437515",
  appId: "1:154271437515:web:10386d1486b66c2d8b814e"
};

const VAPID_KEY = "BIxPaCbXHqbMB-qcc4uGgMM0dFaLN21EO94NZb-w0vwwHUbZcOSovXjMtCULs65EMaoHI0P7z5U9kuA8KHitLZA";
const API = process.env.REACT_APP_API_URL;

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function registerPushToken(authToken) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[push] permission denied");
      return null;
    }
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.ready;
    }
    const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!fcmToken) {
      console.warn("[push] no FCM token received");
      return null;
    }
    await fetch(`${API}/api/push-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token: fcmToken,
        device_type: "web",
        user_type: "resident"
      })
    });
    console.log("[push] resident token registered:", fcmToken.slice(0, 20) + "...");
    return fcmToken;
  } catch (err) {
    console.error("[push] registration error:", err.message);
    return null;
  }
}

export function onForegroundMessage(callback) {
  return onMessage(messaging, (payload) => {
    console.log("[push] foreground message:", payload);
    callback(payload);
  });
}

export { messaging };
