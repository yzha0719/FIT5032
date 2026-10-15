import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

// This config is not a secret. It only identifies the Firebase project, and
// Firebase expects it to ship with the client code. What actually protects the
// data is Authentication plus the rules in firestore.rules — not hiding these
// values. Real secrets (such as the SendGrid key) stay in Cloud Functions.
const firebaseConfig = {
  apiKey: 'AIzaSyBwO4-PARP4F3_0ufSMSHM0iUNARn4akUc',
  authDomain: 'reloop-melbourne-78b45.firebaseapp.com',
  projectId: 'reloop-melbourne-78b45',
  storageBucket: 'reloop-melbourne-78b45.firebasestorage.app',
  messagingSenderId: '1004558189892',
  appId: '1:1004558189892:web:0e8ce1dfb26865a107c311',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

// Same region the functions are deployed to, otherwise calls 404.
export const functions = getFunctions(firebaseApp, 'australia-southeast1')
