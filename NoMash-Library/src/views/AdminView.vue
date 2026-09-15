<script setup>
import { useAuth } from '@/stores/auth'

const { currentUser, role } = useAuth()
</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2 text-center">
        <h1>Admin Dashboard</h1>

        <div class="alert alert-success mt-4" role="alert">
          Only accounts with the <strong>admin</strong> role can see this page.
        </div>

        <p>
          Signed in as <strong>{{ currentUser?.email }}</strong>
          <span class="badge bg-danger ms-1">{{ role }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
