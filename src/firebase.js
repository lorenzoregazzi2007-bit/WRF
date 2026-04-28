// firebase.js — Versione robusta senza crash durante il build
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

let db = null;

export function getDB() {
  return db;
}

export function setupFirebase(config) {
  try {
    if (!config || !config.apiKey || config.apiKey.startsWith('inserisci')) return false;
    
    // Evita doppie inizializzazioni
    if (getApps().length === 0) {
      const app = initializeApp(config);
      db = getFirestore(app);
    } else {
      db = getFirestore(getApps()[0]);
    }
    console.log("🔥 Firebase OK");
    return true;
  } catch (e) {
    console.warn("Firebase non disponibile:", e.message);
    return false;
  }
}

// Inizializza con le credenziali ENV al caricamento
setupFirebase({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});
