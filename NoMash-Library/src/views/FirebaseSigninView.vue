<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref(null)

const signin = async () => {
  errorMessage.value = null
  try {
    const { user, role } = await login(email.value, password.value)
    console.log('User signed in:', user.email, 'role:', role)
    const fallback = role === 'admin' ? '/admin' : '/'
    router.push(route.query.redirect || fallback)
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
        <h1 class="text-center">Sign in</h1>

        <form @submit.prevent="signin">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required />
          </div>

          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary">Sign in via Firebase</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
