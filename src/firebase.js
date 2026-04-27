// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// (Assicurati di inserire i dati reali di Firebase nel file .env)
// Carica config dinamica da localStorage se presente
const savedConfig = localStorage.getItem('wrf_firebase_config');
const dynamicConfig = savedConfig ? JSON.parse(savedConfig) : null;

const firebaseConfig = dynamicConfig || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, db, auth;

// Funzione per reinizializzare Firebase (chiamata quando l'utente salva le chiavi)
export const initializeFirebase = (config = null) => {
  const targetConfig = config || firebaseConfig;
  
  if (!targetConfig.apiKey || targetConfig.apiKey.includes('inserisci_qui')) {
    console.warn("⚠️ Firebase non configurato. Inserisci le chiavi nelle impostazioni dell'app.");
    return;
  }

  try {
    app = initializeApp(targetConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("🔥 Firebase Inizializzato con successo!");
  } catch (error) {
    console.error("❌ Errore inizializzazione Firebase:", error);
  }
};

// Primo tentativo di inizializzazione
initializeFirebase();

export { db, auth };
