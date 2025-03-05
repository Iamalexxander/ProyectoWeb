import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC9AUcqONcYwh-LiRRoutzW-eUHgT8ZgtY",
    authDomain: "proyectoprogra-eaa01.firebaseapp.com",
    projectId: "proyectoprogra-eaa01",
    storageBucket: "proyectoprogra-eaa01.firebasestorage.app",
    messagingSenderId: "689200971605",
    appId: "1:689200971605:web:85a899128a4b27daa279dc"
  };

const app = initializeApp(firebaseConfig);

// Inicializa Firestore con la mejor opción para la conectividad en tiempo real
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalAutoDetectLongPolling: true,  // Usar esta opción para mejor rendimiento
});

const auth = getAuth(app);
const storage = getStorage(app);

// Habilita persistencia offline
if (typeof window !== 'undefined' && 'indexedDB' in window) {
  enableIndexedDbPersistence(db, {
    synchronizeTabs: true
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support persistence.');
    }
  });

  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Auth persistence could not be enabled:', err);
  });
}

export { db, auth, storage };