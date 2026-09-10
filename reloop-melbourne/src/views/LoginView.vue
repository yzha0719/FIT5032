<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, ROLE_LABELS, SELF_SERVICE_ROLES } from '../composables/useAuth'
import {
  required,
  minLength,
  maxLength,
  email as emailValidator,
  passwordStrength,
  matches,
  PASSWORD_RULES,
  runValidators,
} from '../composables/useValidators'

const route = useRoute()
const router = useRouter()
const { currentUser, isAuthenticated, login, register, logout } = useAuth()

const roleDescriptions = {
  member: 'Find recycling help, book events and rate the ones you attend.',
  volunteer: 'Sign up for repair café and swap meet shifts and track your sessions.',
}

/* One screen for both forms, so nobody has to hunt for a separate register page.
   The mode lives in the URL (?mode=register), so a link from another page can
   open the register form directly. */
const mode = computed(() => (route.query.mode === 'register' ? 'register' : 'login'))

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
})

const errors = reactive({
  name: null,
  email: null,
  password: null,
  confirmPassword: null,
  role: null,
})

const formError = ref(null)
const isSubmitting = ref(false)

// Login only checks that fields are filled in. The strength rules apply when
// creating a password, not when typing an existing one.
const loginRules = {
  email: [required('Email'), emailValidator()],
  password: [required('Password')],
}

const registerRules = {
  name: [required('Full name'), minLength('Full name', 2), maxLength('Full name', 80)],
  email: [required('Email'), emailValidator(), maxLength('Email', 254)],
  password: [required('Password'), passwordStrength(), maxLength('Password', 128)],
  confirmPassword: [
    required('Confirm password'),
    matches(() => form.password, 'Passwords do not match.'),
  ],
  role: [required('Account type')],
}

const activeRules = computed(() => (mode.value === 'login' ? loginRules : registerRules))

const passwordChecklist = computed(() =>
  PASSWORD_RULES.map((rule) => ({ text: rule.text, met: rule.test(form.password) })),
)

function validateField(field) {
  errors[field] = runValidators(form[field], activeRules.value[field])
}

function clearErrors() {
  Object.keys(errors).forEach((key) => (errors[key] = null))
  formError.value = null
}

// The buttons only change the URL; `mode` follows it. Keeping the URL as the
// single source means the tab buttons and links like "Create account" in the
// navbar can never disagree about which form is showing.
function switchMode(nextMode) {
  const query = { ...route.query }
  if (nextMode === 'register') {
    query.mode = 'register'
  } else {
    delete query.mode
  }
  router.replace({ query })
}

// Whenever the form changes (by button or by link), drop typed passwords and old errors.
watch(mode, () => {
  form.password = ''
  form.confirmPassword = ''
  clearErrors()
})

// ?role=volunteer pre-selects the account type. It is checked against the
// whitelist, so ?role=admin is ignored.
watch(
  () => route.query.role,
  (role) => {
    if (SELF_SERVICE_ROLES.includes(role)) form.role = role
  },
  { immediate: true },
)

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.role = ''
  clearErrors()
}

// Only follow redirects to paths inside this app. Values like "//evil.com" are
// ignored, so the login page can't be used to send people to another site.
function safeRedirect(value) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null
  return value
}

async function submitForm() {
  formError.value = null
  const fields = Object.keys(activeRules.value)
  fields.forEach(validateField)
  if (fields.some((field) => errors[field])) return

  isSubmitting.value = true
  const result =
    mode.value === 'login'
      ? await login(form.email, form.password)
      : await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        })
  isSubmitting.value = false

  if (!result.ok) {
    formError.value = result.error
    return
  }

  resetForm()
  // Go back to the page the guard sent them from, or to their dashboard.
  router.push(safeRedirect(route.query.redirect) ?? { name: 'dashboard' })
}

function handleLogout() {
  logout()
  switchMode('login')
}
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">My account</p>
      <h1>Log in or<br />join ReLoop.</h1>
      <p class="page-intro__lede">
        One account for booking events, rating the ones you've been to and tracking your volunteer
        sessions. We only ask for what we need.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app auth-wrap">
      <div v-if="isAuthenticated" class="crate-card auth-card">
        <span class="crate-card__tag">SIGNED IN</span>
        <p class="auth-card__who">
          You're signed in as <strong>{{ currentUser.name }}</strong>,
          <span class="auth-card__role">{{ ROLE_LABELS[currentUser.role] }}</span>
        </p>
        <button type="button" class="btn-reloop btn-reloop--outline" @click="handleLogout">
          Log out
        </button>
      </div>

      <div v-else class="crate-card auth-card">
        <span class="crate-card__tag">{{ mode === 'login' ? 'LOG IN' : 'REGISTER' }}</span>

        <div class="auth-switch" role="group" aria-label="Log in or create an account">
          <button
            type="button"
            class="auth-switch__btn"
            :class="{ 'is-active': mode === 'login' }"
            :aria-pressed="mode === 'login'"
            @click="switchMode('login')"
          >
            Log in
          </button>
          <button
            type="button"
            class="auth-switch__btn"
            :class="{ 'is-active': mode === 'register' }"
            :aria-pressed="mode === 'register'"
            @click="switchMode('register')"
          >
            Create account
          </button>
        </div>

        <p v-if="formError" class="auth-card__error" role="alert">{{ formError }}</p>

        <form novalidate @submit.prevent="submitForm">
          <div v-if="mode === 'register'" class="field" :class="{ 'has-error': errors.name }">
            <label for="auth-name">Full name</label>
            <input
              id="auth-name"
              v-model="form.name"
              type="text"
              autocomplete="name"
              @blur="validateField('name')"
            />
            <span v-if="errors.name" class="field__error">{{ errors.name }}</span>
          </div>

          <div class="field" :class="{ 'has-error': errors.email }">
            <label for="auth-email">Email</label>
            <input
              id="auth-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              @blur="validateField('email')"
            />
            <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
          </div>

          <div class="field" :class="{ 'has-error': errors.password }">
            <label for="auth-password">Password</label>
            <input
              id="auth-password"
              v-model="form.password"
              type="password"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              @blur="validateField('password')"
            />
            <ul
              v-if="mode === 'register'"
              class="password-checklist"
              aria-label="Password requirements"
            >
              <li
                v-for="rule in passwordChecklist"
                :key="rule.text"
                :class="{ 'is-met': rule.met }"
              >
                <span aria-hidden="true">{{ rule.met ? '✓' : '○' }}</span>
                {{ rule.text }}
                <span class="visually-hidden">{{ rule.met ? '(met)' : '(not met yet)' }}</span>
              </li>
            </ul>
            <span v-if="errors.password" class="field__error">{{ errors.password }}</span>
          </div>

          <template v-if="mode === 'register'">
            <div class="field" :class="{ 'has-error': errors.confirmPassword }">
              <label for="auth-confirm">Confirm password</label>
              <input
                id="auth-confirm"
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                @blur="validateField('confirmPassword')"
              />
              <span v-if="errors.confirmPassword" class="field__error">{{
                errors.confirmPassword
              }}</span>
            </div>

            <fieldset class="role-picker" :class="{ 'has-error': errors.role }">
              <legend>Account type</legend>
              <div class="role-picker__options">
                <label
                  v-for="role in SELF_SERVICE_ROLES"
                  :key="role"
                  class="role-option"
                  :class="{ 'is-selected': form.role === role }"
                >
                  <input
                    v-model="form.role"
                    type="radio"
                    name="role"
                    :value="role"
                    @change="validateField('role')"
                  />
                  <span class="role-option__label">{{ ROLE_LABELS[role] }}</span>
                  <span class="role-option__desc">{{ roleDescriptions[role] }}</span>
                </label>
              </div>
              <span v-if="errors.role" class="field__error">{{ errors.role }}</span>
            </fieldset>
          </template>

          <!-- mousedown.prevent keeps focus in the current input, so its blur
               validation can't push the button down mid-click and swallow the
               submit. submitForm validates every field anyway. -->
          <button
            type="submit"
            class="btn-reloop btn-reloop--primary auth-submit"
            :disabled="isSubmitting"
            @mousedown.prevent
          >
            {{ mode === 'login' ? 'Log in' : 'Create account' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-intro {
  padding: 3.5rem 0;
}

.page-intro__lede {
  max-width: 60ch;
  color: var(--kraft);
  font-size: 1.05rem;
}

.auth-wrap {
  max-width: 36rem;
}

.auth-card {
  padding-top: 2rem;
  height: auto;
}

.auth-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 2px solid var(--ink);
  border-radius: var(--radius);
  overflow: hidden;
  margin: 0.5rem 0 1.5rem;
}

.auth-switch__btn {
  min-height: 44px;
  padding: 0.75em 1em;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.auth-switch__btn.is-active {
  background-color: var(--ink);
  color: var(--paper);
}

.auth-card__error {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--reclaim-dark);
  background-color: var(--paper);
  border: 2px solid var(--reclaim);
  border-radius: var(--radius);
}

.password-checklist {
  display: grid;
  gap: 0.15rem;
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.password-checklist li.is-met {
  color: var(--loop);
  font-weight: 600;
}

.role-picker {
  margin-bottom: 1.5rem;
}

.role-picker legend {
  float: none;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.role-picker__options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.role-option {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.6rem;
  align-items: start;
  padding: 0.85rem;
  background-color: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--radius);
  cursor: pointer;
}

.role-option.is-selected {
  border-color: var(--loop);
  box-shadow: inset 0 0 0 1px var(--loop);
}

.role-picker.has-error .role-option {
  border-color: var(--reclaim);
}

.role-option input {
  margin-top: 0.3rem;
  accent-color: var(--loop);
}

.role-option__label {
  font-weight: 700;
}

.role-option__desc {
  grid-column: 2;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.auth-submit {
  width: 100%;
}

.auth-card__who {
  font-size: 1.05rem;
}

.auth-card__role {
  display: inline-block;
  margin-left: 0.4rem;
  padding: 0.15em 0.5em;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paper);
  background-color: var(--ink);
  border-radius: 3px;
}

@media (min-width: 576px) {
  .role-picker__options {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
