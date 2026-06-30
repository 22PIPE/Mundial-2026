// ─── Inicialización de Firebase ───────────────
// App, Firestore y Auth. Todo lo demás importa sus instancias desde aquí.

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, deleteDoc }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { firebaseConfig } from './config.js';

export const app      = initializeApp(firebaseConfig);
export const db       = getFirestore(app);
export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();
export const DOCREF   = doc(db, "mundial2026", "datos");

// Re-exportamos las funciones de Firestore/Auth que necesitan otros módulos,
// para que solo este archivo conozca los imports de los SDKs de Firebase.
export { setDoc, onSnapshot, deleteDoc, signInWithPopup, signOut, onAuthStateChanged };
