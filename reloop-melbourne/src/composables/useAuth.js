import { computed } from 'vue'
import { users as seedUsers } from '../data/users'
import { useLocalStorageState } from './useLocalStorageState'
import {
  required,
  minLength,
  maxLength,
  email as emailValidator,
  passwordStrength,
  runValidators,
} from './useValidators'
import { createSalt, hashPassword, verifyPassword } from '../utils/passwords'

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

// localStorage can be edited in DevTools, so only accept stored accounts that
// register() could have created: a self-service role and a hashed password.
// A hand-added { role: 'admin' } record, or an old record with a plain-text
// password, is ignored. Admin accounts can only come from the seed data.
function isValidRegisteredUser(user) {
  return (
    typeof user?.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.salt === 'string' &&
    typeof user.passwordHash === 'string' &&
    SELF_SERVICE_ROLES.includes(user.role)
  )
}

const allUsers = computed(() => [
  ...seedUsers,
  ...registeredUsers.value.filter(isValidRegisteredUser),
])

const currentUser = computed(() => {
  if (!session.value) return null
  const user = allUsers.value.find((u) => u.id === session.value.userId)
  if (!user) return null
  // Never expose the salt or hash to the rest of the app.
  const { salt: _salt, passwordHash: _passwordHash, ...publicFields } = user
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

/* Slowing down repeated guesses */

// Failed logins per email, kept in memory. After MAX_ATTEMPTS wrong tries that
// email is locked for LOCK_MS. A page refresh clears this, so it slows down
// casual guessing rather than stopping a determined attacker; that needs a server.
const MAX_ATTEMPTS = 5
const LOCK_MS = 30_000
const failedLogins = new Map()

function lockSecondsLeft(email) {
  const lockedUntil = failedLogins.get(email)?.lockedUntil ?? 0
  return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
}

function recordFailedLogin(email) {
  const entry = failedLogins.get(email) ?? { count: 0, lockedUntil: 0 }
  entry.count += 1
  if (entry.count >= MAX_ATTEMPTS) {
    entry.count = 0
    entry.lockedUntil = Date.now() + LOCK_MS
  }
  failedLogins.set(email, entry)
}

// Checked against when the email doesn't exist, so a wrong email takes as
// long to reject as a wrong password and response time doesn't reveal which
// emails have accounts.
const DUMMY_SALT = '0'.repeat(32)
const DUMMY_HASH = '0'.repeat(64)

async function login(email, password) {
  const key = normaliseEmail(email)
  const waitSeconds = lockSecondsLeft(key)
  if (waitSeconds > 0) {
    return {
      ok: false,
      error: `Too many attempts. Please wait ${waitSeconds} seconds and try again.`,
    }
  }

  const user = findUserByEmail(key)
  const passwordMatches = await verifyPassword(
    String(password ?? ''),
    user ? user.salt : DUMMY_SALT,
    user ? user.passwordHash : DUMMY_HASH,
  )

  if (!user || !passwordMatches) {
    recordFailedLogin(key)
    // Same message for both cases, so the form doesn't reveal which emails exist.
    return { ok: false, error: 'Email or password is incorrect.' }
  }

  failedLogins.delete(key)
  session.value = { userId: user.id }
  return { ok: true }
}

// The register form checks these too, but that only helps people using the
// form. Checking again here means nothing reaches storage without passing the
// same rules, however register() is called.
const registerRules = {
  name: [required('Full name'), minLength('Full name', 2), maxLength('Full name', 80)],
  email: [required('Email'), emailValidator(), maxLength('Email', 254)],
  password: [required('Password'), passwordStrength(), maxLength('Password', 128)],
}

async function register({ name, email, password, role }) {
  const fields = {
    name: String(name ?? '').trim(),
    email: normaliseEmail(email),
    password: String(password ?? ''),
  }

  for (const [field, rules] of Object.entries(registerRules)) {
    const error = runValidators(fields[field], rules)
    if (error) return { ok: false, error }
  }
  if (!SELF_SERVICE_ROLES.includes(role)) {
    return { ok: false, error: 'Please choose a valid account type.' }
  }
  if (findUserByEmail(fields.email)) {
    return { ok: false, error: 'An account with this email already exists.' }
  }

  // Only the salt and hash are saved. The plain password is never stored.
  const salt = createSalt()
  const newUser = {
    id: crypto.randomUUID(),
    name: fields.name,
    email: fields.email,
    salt,
    passwordHash: await hashPassword(fields.password, salt),
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
