import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"

interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const googleProvider = new GoogleAuthProvider()


// Configure GoogleAuthProvider with additional parameters
googleProvider.setCustomParameters({
  prompt: "select_account",
  access_type: "offline",
})
