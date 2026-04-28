// dataService.js — Salvataggio locale + Firebase opzionale
import { getDB } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'wrf_data';
const DOC_ID = 'moto_principale';

export const dataService = {

  saveLocal(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadLocal() {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  },

  async saveCloud(data) {
    const db = getDB();
    if (!db) return;
    try {
      await setDoc(doc(db, 'maintenance', DOC_ID), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Sync cloud fallita:", e.message);
    }
  },

  subscribeToCloud(callback) {
    const db = getDB();
    if (!db) return () => {};
    return onSnapshot(doc(db, 'maintenance', DOC_ID), snapshot => {
      if (snapshot.exists()) callback(snapshot.data());
    }, () => {});
  }
};
