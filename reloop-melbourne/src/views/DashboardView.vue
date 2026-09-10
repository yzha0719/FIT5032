<script setup>
import { useAuth, ROLE_LABELS } from '../composables/useAuth'

const { currentUser } = useAuth()
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">My account</p>
      <h1>My dashboard</h1>
      <p v-if="currentUser" class="page-intro__lede">
        Signed in as {{ currentUser.name }}, {{ ROLE_LABELS[currentUser.role] }}.
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
</style>
