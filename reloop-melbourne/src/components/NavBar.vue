<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AccountNav from './AccountNav.vue'

const isOpen = ref(false)
const route = useRoute()

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/recycling-hub', label: 'Recycling & Waste Hub' },
  { to: '/learning-centre', label: 'Learning Centre' },
  { to: '/get-involved', label: 'Get Involved' },
  { to: '/contact', label: 'Contact' }
]

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}
</script>

<template>
  <header class="site-nav bg-ink">
    <div class="site-nav__account-bar">
      <div class="container-app">
        <AccountNav variant="bar" />
      </div>
    </div>

    <div class="container-app site-nav__bar">
      <router-link to="/" class="site-nav__brand" @click="closeMenu">
        <span class="site-nav__brand-mark">ReLoop</span>
        <span class="site-nav__brand-sub">Melbourne</span>
      </router-link>

      <button
        class="site-nav__toggle"
        type="button"
        :aria-expanded="isOpen"
        aria-controls="primary-navigation"
        aria-label="Toggle navigation menu"
        @click="toggleMenu"
      >
        <span :class="['site-nav__toggle-bar', { 'is-open': isOpen }]"></span>
        <span :class="['site-nav__toggle-bar', { 'is-open': isOpen }]"></span>
        <span :class="['site-nav__toggle-bar', { 'is-open': isOpen }]"></span>
      </button>

      <nav id="primary-navigation" :class="['site-nav__links', { 'is-open': isOpen }]">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="site-nav__link"
          :class="{ 'is-active': route.path === link.to }"
          @click="closeMenu"
        >
          {{ link.label }}
        </router-link>
        <router-link to="/get-involved" class="btn-reloop btn-reloop--primary btn-reloop--sm site-nav__cta" @click="closeMenu">
          Donate
        </router-link>
        <AccountNav variant="menu" class="site-nav__account-menu" @navigate="closeMenu" />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-nav {
  position: sticky;
  top: 0;
  z-index: 40;
}

.site-nav__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.25rem;
}

.site-nav__brand {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  text-decoration: none;
  font-family: var(--font-display);
  color: var(--paper);
}

.site-nav__brand-mark {
  font-size: 1.5rem;
  font-weight: 800;
  text-transform: uppercase;
}

.site-nav__brand-sub {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--reclaim);
}

.site-nav__toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 2px solid var(--paper);
  border-radius: 4px;
  cursor: pointer;
}

.site-nav__toggle-bar {
  display: block;
  height: 2px;
  margin: 0 7px;
  background-color: var(--paper);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.site-nav__links {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--ink);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.site-nav__links.is-open {
  /* Tall enough for the account section too; scrolls on very short screens */
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.site-nav__account-bar {
  display: none;
  border-bottom: 1px solid rgba(237, 238, 228, 0.12);
}

.site-nav__link {
  padding: 0.85rem 1.25rem;
  color: var(--paper);
  text-decoration: none;
  font-weight: 600;
  border-top: 1px solid rgba(237, 238, 228, 0.12);
}

.site-nav__link.is-active {
  color: var(--reclaim);
}

.site-nav__cta {
  margin: 0.85rem 1.25rem;
  align-self: flex-start;
}

@media (min-width: 992px) {
  .site-nav__toggle {
    display: none;
  }

  /* Account links move out of the menu into their own bar, so the main nav
     row doesn't overflow between 992px and 1400px */
  .site-nav__account-bar {
    display: block;
  }

  .site-nav__links .site-nav__account-menu {
    display: none;
  }

  .site-nav__links {
    position: static;
    flex-direction: row;
    align-items: center;
    max-height: none;
    overflow: visible;
    background-color: transparent;
    gap: 0.35rem;
  }

  .site-nav__link {
    border-top: none;
    padding: 0.5rem 0.85rem;
    font-size: 0.92rem;
  }

  .site-nav__cta {
    margin: 0 0 0 0.75rem;
  }
}
</style>
