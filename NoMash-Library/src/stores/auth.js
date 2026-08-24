import { ref } from 'vue'

// Hardcoded credentials for this exercise (Step 6: Custom Routing)
const HARDCODED_USERNAME = 'admin'
const HARDCODED_PASSWORD = 'password123'

// Module-level refs act as simple shared/global state across the app
const isAuthenticated = ref(false)
const username = ref('')

function login(inputUsername, inputPassword) {
  if (inputUsername === HARDCODED_USERNAME && inputPassword === HARDCODED_PASSWORD) {
    isAuthenticated.value = true
    username.value = inputUsername
    return true
  }
  return false
}

function logout() {
  isAuthenticated.value = false
  username.value = ''
}

export function useAuth() {
  return { isAuthenticated, username, login, logout }
}
