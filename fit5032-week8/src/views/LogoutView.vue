<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase/init'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const { currentUser, role, logout } = useAuth()

onMounted(() => {
  console.log('Current user:', auth.currentUser)
  console.log('Current role:', role.value)
})

const handleLogout = async () => {
  await logout()
  console.log('Signed out. Current user is now:', auth.currentUser)
  router.push('/FireLogin')
}
</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3 text-center">
        <h1>Log out</h1>

        <div class="card mt-4 text-start">
          <div class="card-body">
            <p class="mb-1"><strong>Email:</strong> {{ currentUser?.email }}</p>
            <p class="mb-1"><strong>UID:</strong> {{ currentUser?.uid }}</p>
            <p class="mb-0"><strong>Role:</strong> {{ role }}</p>
          </div>
        </div>

        <p class="mt-4">Are you sure you want to log out?</p>
        <button type="button" class="btn btn-danger" @click="handleLogout">Log out</button>
      </div>
    </div>
  </div>
</template>
