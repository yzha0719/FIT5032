<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const formData = ref({
  username: '',
  password: ''
})

const errorMessage = ref(null)

const submitForm = () => {
  const success = login(formData.value.username, formData.value.password)

  if (success) {
    errorMessage.value = null
    const redirectPath = route.query.redirect || '/about'
    router.push(redirectPath)
  } else {
    errorMessage.value = 'Invalid username or password. Please try again.'
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1 class="text-center">Member Login</h1>

        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input
              type="text"
              class="form-control"
              id="username"
              v-model="formData.username"
              required
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="formData.password"
              required
            />
          </div>

          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}
</style>
