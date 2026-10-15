<script setup>
import NavBar from './components/NavBar.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <!-- First stop for keyboard users: jump past the navigation (BR E.3) -->
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <NavBar />
  <!-- tabindex="-1" lets the skip link move focus here, not just scroll -->
  <main id="main-content" tabindex="-1">
    <router-view />
  </main>
  <SiteFooter />
</template>
