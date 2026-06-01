import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const isMock = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'MOCK_API_KEY';

let app;
let db: any = null;
let auth: any = null;

if (!isMock) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Falha ao inicializar o Firebase. Usando banco de dados local fallback.', error);
  }
}

export { db, auth };
