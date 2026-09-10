import { computed } from 'vue'
import { users as seedUsers } from '../data/users'
import { useLocalStorageState } from './useLocalStorageState'

// Roles a visitor can pick for themselves when registering.
// 'admin' is deliberately left out: admin accounts only exist in the seed data,
// so nobody can give themselves admin rights through the register form.
export const SELF_SERVICE_ROLES = ['member', 'volunteer']

// Display names for each role, shared by the navbar, login page and dashboards.
export const ROLE_LABELS = {
  member: 'Community Member',
  volunteer: 'Volunteer',
  admin: 'Administrator',
}

// Module-level state: created once when this file is first imported, so every
// component that calls useAuth() shares the same login state.
const registeredUsers = useLocalStorageState('reloop:registered-users', [])

// The session only stores the user's id. Name and role are always looked up
// from the user list, so editing localStorage to change "role" has no effect.
const session = useLocalStorageState('reloop:session', null)

const allUsers = computed(() => [...seedUsers, ...registeredUsers.value])

const currentUser = computed(() => {
  if (!session.value) return null
  const user = allUsers.value.find((u) => u.id === session.value.userId)
  if (!user) return null
  // Never expose the password to the rest of the app.
  const { password: _password, ...publicFields } = user
  return publicFields
})

const isAuthenticated = computed(() => currentUser.value !== null)

function normaliseEmail(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function findUserByEmail(email) {
  const target = normaliseEmail(email)
  return allUsers.value.find((u) => normaliseEmail(u.email) === target)
}

// login/register are async even though nothing awaits yet: password hashing
// (BR C.4) uses the Web Crypto API, which is async, so keeping this signature
// now means the views won't need to change later.
async function login(email, password) {
  const user = findUserByEmail(email)
  // TODO (BR C.4): compare hashed passwords instead of plain text.
  if (!user || user.password !== password) {
    // Same message for both cases, so the form doesn't reveal which emails exist.
    return { ok: false, error: 'Email or password is incorrect.' }
  }
  session.value = { userId: user.id }
  return { ok: true }
}

async function register({ name, email, password, role }) {
  if (!SELF_SERVICE_ROLES.includes(role)) {
    return { ok: false, error: 'Please choose a valid account type.' }
  }
  if (findUserByEmail(email)) {
    return { ok: false, error: 'An account with this email already exists.' }
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normaliseEmail(email),
    // TODO (BR C.4): store a salted hash instead of the plain password.
    password,
    role,
  }
  registeredUsers.value = [...registeredUsers.value, newUser]
  session.value = { userId: newUser.id }
  return { ok: true }
}

function logout() {
  session.value = null
}

function hasRole(...roles) {
  return isAuthenticated.value && roles.includes(currentUser.value.role)
}

export function useAuth() {
  return { currentUser, isAuthenticated, login, register, logout, hasRole }
}
