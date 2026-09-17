<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3 text-center">
        <h1>Access Denied</h1>

        <div class="alert alert-warning mt-4" role="alert">
          You do not have permission to view this page. Please log in with an
          authorised account and try again.
        </div>

        <div class="mt-4">
          <button type="button" class="btn btn-primary me-2" @click="goLogin">
            Go to Login
          </button>
          <button type="button" class="btn btn-secondary" @click="goHome">
            Back to Home
          </button>
        </div>
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
