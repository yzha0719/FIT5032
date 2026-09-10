<script setup>
import { useAuth, ROLE_LABELS } from '../composables/useAuth'

const { currentUser } = useAuth()
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Access denied</p>
      <h1>This page isn't<br />open to you.</h1>
      <p class="page-intro__lede">
        <template v-if="currentUser">
          Your account type ({{ ROLE_LABELS[currentUser.role] }}) doesn't include this page.
        </template>
        <template v-else>You need to log in to see this page.</template>
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <div class="denied-actions">
        <router-link
          v-if="currentUser"
          :to="{ name: 'dashboard' }"
          class="btn-reloop btn-reloop--primary"
        >
          Go to my dashboard
        </router-link>
        <router-link v-else :to="{ name: 'login' }" class="btn-reloop btn-reloop--primary">
          Log in
        </router-link>
        <router-link to="/" class="btn-reloop btn-reloop--outline">Back to home</router-link>
      </div>
      <p class="denied-help">
        Think you should have access? <router-link to="/contact">Contact the team</router-link>.
      </p>
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

.denied-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.denied-help {
  color: var(--ink-soft);
}
</style>
