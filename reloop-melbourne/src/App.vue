<script setup>
</script>

<template>
  <nav style="padding: 1rem; display: flex; gap: 1rem;">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
    <router-link to="/recycling-hub">Recycling Hub</router-link>
    <router-link to="/learning-centre">Learning Centre</router-link>
    <router-link to="/get-involved">Get Involved</router-link>
    <router-link to="/contact">Contact</router-link>
  </nav>
  <main>
    <router-view />
  </main>
</template>
