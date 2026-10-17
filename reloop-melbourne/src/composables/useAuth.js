import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions } from '../firebase'
import {
  required,
  minLength,
  maxLength,
  email as emailValidator,
  passwordStrength,
  runValidators,
} from './useValidators'

// Roles a visitor can pick for themselves when registering. 'admin' is left
// out on purpose, and the Firestore rules reject it as well: an administrator
// is only ever granted by the setUserRole Cloud Function.
export const SELF_SERVICE_ROLES = ['member', 'volunteer']

// Roles an administrator can hand out from the admin page.
export const ASSIGNABLE_ROLES = ['member', 'volunteer', 'admin']

// Display names for each role, shared by the navbar, login page and dashboards.
export const ROLE_LABELS = {
  member: 'Community Member',
  volunteer: 'Volunteer',
  admin: 'Administrator',
}

// Module-level state, so every component shares one copy of the logged-in user.
// Shape stays the same as the old local version ({ id, name, email, role }),
// which is why the rest of the app didn't need rewriting.
const currentUser = ref(null)
const isAuthenticated = computed(() => currentUser.value !== null)

// Firebase restores the signed-in user asynchronously after a page load, so
// anything that depends on "am I logged in?" has to wait for the first answer.
let markReady
const authReady = new Promise((resolve) => {
  markReady = resolve
})

export function waitForAuth() {
  return authReady
}

// Someone signing in with Google has no profile document yet. Create one with
// the lowest role; the rules only accept member or volunteer here.
async function ensureProfile(firebaseUser) {
  const profileRef = doc(db, 'users', firebaseUser.uid)
  const snapshot = await getDoc(profileRef)
  if (snapshot.exists()) return snapshot.data()

  const profile = {
    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    email: firebaseUser.email,
    role: 'member',
    createdAt: serverTimestamp(),
  }
  await setDoc(profileRef, profile)
  return profile
}

// Set while register() is still writing the new profile. Firebase reports the
// new account as signed in the moment it is created, which is before the name
// and role exist, so anything reading the profile waits for that write first.
let pendingProfileWrite = null

// Loads the role from Firestore and publishes the user to the whole app.
// login() awaits this too: signing in with Firebase resolves before the role
// is known, and the route guard would otherwise still see a signed-out user.
async function applyUser(firebaseUser) {
  if (!firebaseUser) {
    currentUser.value = null
    return
  }
  if (pendingProfileWrite) {
    await pendingProfileWrite
  }
  const profile = await ensureProfile(firebaseUser)
  currentUser.value = {
    id: firebaseUser.uid,
    name: profile.name,
    email: firebaseUser.email,
    role: profile.role,
  }
}

onAuthStateChanged(auth, async (firebaseUser) => {
  await applyUser(firebaseUser)
  markReady()
})

// Firebase error codes are not something to show a user. Wrong email and wrong
// password share one message, so the form doesn't reveal which emails exist.
function loginErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Could not reach the server. Check your connection and try again.'
    default:
      return 'Email or password is incorrect.'
  }
}

async function login(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      String(email).trim(),
      String(password),
    )
    await applyUser(credential.user)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: loginErrorMessage(error.code) }
  }
}

async function loginWithGoogle() {
  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider())
    await applyUser(credential.user)
    return { ok: true }
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return { ok: false, error: 'Google sign-in was cancelled.' }
    }
    return { ok: false, error: 'Google sign-in failed. Please try again or use your email.' }
  }
}

// The register form checks these too, but that only helps people using the
// form. Checking again here means nothing reaches Firebase without passing the
// same rules, however register() is called.
const registerRules = {
  name: [required('Full name'), minLength('Full name', 2), maxLength('Full name', 80)],
  email: [required('Email'), emailValidator(), maxLength('Email', 254)],
  password: [required('Password'), passwordStrength(), maxLength('Password', 128)],
}

async function register({ name, email, password, role }) {
  const fields = {
    name: String(name ?? '').trim(),
    email: String(email ?? '')
      .trim()
      .toLowerCase(),
    password: String(password ?? ''),
  }

  for (const [field, rules] of Object.entries(registerRules)) {
    const error = runValidators(fields[field], rules)
    if (error) return { ok: false, error }
  }
  if (!SELF_SERVICE_ROLES.includes(role)) {
    return { ok: false, error: 'Please choose a valid account type.' }
  }

  // Hold back the auth listener until the profile document exists, so it
  // doesn't see a brand-new account with no profile and create a default one.
  let finishProfileWrite
  pendingProfileWrite = new Promise((resolve) => {
    finishProfileWrite = resolve
  })

  try {
    const credential = await createUserWithEmailAndPassword(auth, fields.email, fields.password)
    await updateProfile(credential.user, { displayName: fields.name })
    await setDoc(doc(db, 'users', credential.user.uid), {
      name: fields.name,
      email: fields.email,
      role,
      createdAt: serverTimestamp(),
    })
    finishProfileWrite()
    pendingProfileWrite = null
    await applyUser(credential.user)
    return { ok: true }
  } catch (error) {
    finishProfileWrite()
    pendingProfileWrite = null
    if (error.code === 'auth/email-already-in-use') {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    if (error.code === 'auth/weak-password') {
      return { ok: false, error: 'Please choose a stronger password.' }
    }
    return { ok: false, error: 'Could not create the account. Please try again.' }
  }
}

function logout() {
  return signOut(auth)
}

function hasRole(...roles) {
  return isAuthenticated.value && roles.includes(currentUser.value.role)
}

// Account list for the admin page. The Firestore rules only return the whole
// collection to an admin, so this is checked on the server as well as here.
async function fetchUsers() {
  if (!hasRole('admin')) return []
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map((entry) => {
    const data = entry.data()
    return {
      id: entry.id,
      name: data.name,
      email: data.email,
      role: data.role,
      // serverTimestamp() is null for a moment right after a write.
      createdAt: data.createdAt?.toDate?.() ?? null,
    }
  })
}

// BR E.1 + C.2: role changes go through a Cloud Function, because a rule that
// asked the browser whether the browser is an admin would prove nothing. The
// messages below are ones the function wrote itself, so they are safe to show.
const callSetUserRole = httpsCallable(functions, 'setUserRole')

// The callable SDK appends the HTTP status to the message it carries back,
// which readers don't need to see: "Please log in first. [401]".
export function stripStatusCode(message) {
  return String(message ?? '').replace(/\s*\[\d{3}\]$/, '')
}

async function changeUserRole(uid, role) {
  const expected = [
    'functions/unauthenticated',
    'functions/permission-denied',
    'functions/invalid-argument',
    'functions/failed-precondition',
    'functions/not-found',
  ]
  try {
    const result = await callSetUserRole({ uid, role })
    return { ok: true, ...result.data }
  } catch (error) {
    return {
      ok: false,
      error: expected.includes(error.code)
        ? stripStatusCode(error.message)
        : 'Could not change the role right now. Please try again in a moment.',
    }
  }
}

export function useAuth() {
  return {
    currentUser,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    hasRole,
    fetchUsers,
    changeUserRole,
  }
}
