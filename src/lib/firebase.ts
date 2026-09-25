import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Environment switch: defaults to false unless explicitly set to 'true'
export const isFirebaseEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let isFirebaseConfigured = false;

if (isFirebaseEnabled) {
  try {
    const firebaseConfig = {
      apiKey: firebaseConfigJson.apiKey,
      authDomain: firebaseConfigJson.authDomain,
      projectId: firebaseConfigJson.projectId,
      storageBucket: firebaseConfigJson.storageBucket,
      messagingSenderId: firebaseConfigJson.messagingSenderId,
      appId: firebaseConfigJson.appId,
      measurementId: firebaseConfigJson.measurementId,
    };

    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      // Support custom Firestore database ID if provided in config
      const dbId = (firebaseConfigJson as { firestoreDatabaseId?: string }).firestoreDatabaseId;
      db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
      if (firebaseConfig.storageBucket) {
        try {
          storage = getStorage(app);
        } catch (stErr) {
          console.warn('[Firebase Storage] Init warning:', stErr);
        }
      }
      isFirebaseConfigured = true;
      console.info('[Firebase] Initialized with remote Firebase services.');
    } else {
      console.warn('[Firebase] Configuration credentials incomplete.');
    }
  } catch (error) {
    console.warn('[Firebase] Initialization error, falling back to local demo mode:', error);
  }
} else {
  // Standalone local demo mode
  // Firebase configuration remains intact in firebase-applet-config.json for future activation.
}

export { app, auth, db, storage, isFirebaseConfigured };

