import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/init'

export const ROLES = ['admin', 'user']

// Module-level refs act as simple shared/global state across the app
const currentUser = ref(null)
const role = ref(null)

const isAuthenticated = computed(() => currentUser.value !== null)
const isAdmin = computed(() => role.value === 'admin')

async function fetchRole(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? snapshot.data().role : 'user'
}

// Resolves once Firebase has restored (or not) the previous session and the
// role has been loaded, so the router guard never sees a half-loaded state.
let resolveReady
const authReady = new Promise((resolve) => (resolveReady = resolve))

// Set during registration: the auth listener fires before the users/{uid}
// document is written, so it must not read the role from Firestore yet.
let pendingRole = null

onAuthStateChanged(auth, async (user) => {
  if (user) {
    role.value = pendingRole ?? (await fetchRole(user.uid))
    currentUser.value = user
  } else {
    currentUser.value = null
    role.value = null
  }
  resolveReady()
})

async function register(email, password, selectedRole) {
  pendingRole = selectedRole
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: selectedRole,
      createdAt: new Date().toISOString()
    })
    role.value = selectedRole
    currentUser.value = user
    return user
  } finally {
    pendingRole = null
  }
}

async function login(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  role.value = await fetchRole(user.uid)
  currentUser.value = user
  return { user, role: role.value }
}

async function logout() {
  await signOut(auth)
  currentUser.value = null
  role.value = null
}

export function useAuth() {
  return { currentUser, role, isAuthenticated, isAdmin, authReady, register, login, logout }
}
