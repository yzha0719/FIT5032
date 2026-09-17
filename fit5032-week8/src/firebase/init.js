// Firebase is initialised here (not in main.js) so that any module importing
// `auth` or `db` is guaranteed to get an initialised app.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAvpU0VNZ6BAcSBOVytfIV9SeDAbLr2B5c',
  authDomain: 'fit5032-4eeab.firebaseapp.com',
  projectId: 'fit5032-4eeab',
  storageBucket: 'fit5032-4eeab.firebasestorage.app',
  messagingSenderId: '781450846986',
  appId: '1:781450846986:web:6c806cddb4d7948f4b10f3'
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default db
