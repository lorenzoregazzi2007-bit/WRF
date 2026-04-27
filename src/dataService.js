import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'wrf_data';
const CLOUD_DOC_ID = 'user_moto_data'; // Ideally this should be custom or per-user

export const dataService = {
  // Save locally
  saveLocal: (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Load locally
  loadLocal: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  // Save to Cloud (Firebase)
  saveCloud: async (data) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'maintenance', CLOUD_DOC_ID), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      console.log("☁️ Dati sincronizzati sul cloud");
    } catch (error) {
      console.error("❌ Errore sync cloud:", error);
    }
  },

  // Listen for cloud changes (Optional for real-time)
  subscribeToCloud: (callback) => {
    if (!db) return () => {};
    return onSnapshot(doc(db, 'maintenance', CLOUD_DOC_ID), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }
};
