<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, ROLES } from '@/stores/auth'

const router = useRouter()
const { register, logout } = useAuth()

const email = ref('')
const password = ref('')
const role = ref('user')
const errorMessage = ref(null)

const handleRegister = async () => {
  errorMessage.value = null
  try {
    const user = await register(email.value, password.value, role.value)
    console.log('Firebase Register successful:', user.email, 'role:', role.value)
    // Sign out so the new account has to sign in through the login page
    await logout()
    router.push('/FireLogin')
  } catch (error) {
    console.error(error.code)
    errorMessage.value = error.code
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1 class="text-center">Create an Account</h1>

        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="password"
              minlength="6"
              required
            />
          </div>

          <div class="mb-3">
            <label for="role" class="form-label">Role</label>
            <select class="form-select" id="role" v-model="role">
              <option v-for="r in ROLES" :key="r" :value="r">
                {{ r.charAt(0).toUpperCase() + r.slice(1) }}
              </option>
            </select>
          </div>

          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary">Save to Firebase</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
