<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-ink site-footer">
    <div class="container-app site-footer__grid">
      <div>
        <p class="eyebrow">ReLoop Melbourne</p>
        <p class="site-footer__tagline">Keep it in circulation.</p>
      </div>
      <div class="site-footer__links">
        <router-link to="/recycling-hub">Recycling & Waste Hub</router-link>
        <router-link to="/get-involved">Volunteer</router-link>
        <router-link to="/contact">Contact</router-link>
      </div>
    </div>
    <div class="container-app site-footer__bottom">
      <span>&copy; {{ year }} ReLoop Melbourne. A community not-for-profit.</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 2.5rem 0 1.25rem;
  margin-top: 2rem;
}

.site-footer__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(237, 238, 228, 0.15);
}

.site-footer__tagline {
  font-family: var(--font-display);
  font-size: 1.4rem;
  text-transform: uppercase;
  margin: 0.35rem 0 0;
}

.site-footer__links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.site-footer__links a {
  color: var(--paper);
  text-decoration: none;
  font-size: 0.92rem;
}

.site-footer__links a:hover {
  color: var(--reclaim);
}

.site-footer__bottom {
  padding-top: 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--chalk);
}

@media (min-width: 576px) {
  .site-footer__links {
    flex-direction: row;
    gap: 1.5rem;
  }
}
</style>
