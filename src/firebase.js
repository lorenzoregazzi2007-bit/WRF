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

// Inizializza con le credenziali reali
setupFirebase({
  apiKey: "AIzaSyCxUrNR7D6X0VY7A872awxMKCNUhemjsUc",
  authDomain: "wr450app.firebaseapp.com",
  projectId: "wr450app",
  storageBucket: "wr450app.firebasestorage.app",
  messagingSenderId: "787952086469",
  appId: "1:787952086469:web:a1f3d153b63db0189b2fac",
});
