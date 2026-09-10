<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, ROLE_LABELS } from '../composables/useAuth'

// NavBar renders this twice with the same data and logic: as a slim bar above
// the main nav on desktop ('bar'), and as a section inside the collapsible
// menu on smaller screens ('menu').
defineProps({
  variant: {
    type: String,
    default: 'bar',
  },
})

const emit = defineEmits(['navigate'])

const router = useRouter()
const { currentUser, isAuthenticated, logout, hasRole } = useAuth()

// Order and labels live here. Who can see each page comes from `meta.roles`
// in the router, so the menu and the access rules can't drift apart.
const accountLinks = [
  { name: 'dashboard', label: 'My Dashboard' },
  { name: 'volunteer-shifts', label: 'Volunteer Shifts' },
  { name: 'admin', label: 'Admin' },
]

const visibleLinks = computed(() =>
  accountLinks.filter((link) => {
    const { roles } = router.resolve({ name: link.name }).meta
    return !roles || hasRole(...roles)
  }),
)

function handleLogout() {
  logout()
  emit('navigate')
  router.push({ name: 'home' })
}
</script>

<template>
  <div :class="['account-nav', `account-nav--${variant}`]">
    <p v-if="variant === 'menu'" class="account-nav__heading">My account</p>

    <template v-if="isAuthenticated">
      <p class="account-nav__who">
        {{ currentUser.name }},
        <span class="account-nav__role">{{ ROLE_LABELS[currentUser.role] }}</span>
      </p>
      <router-link
        v-for="link in visibleLinks"
        :key="link.name"
        :to="{ name: link.name }"
        class="account-nav__link"
        active-class="is-active"
        @click="emit('navigate')"
      >
        {{ link.label }}
      </router-link>
      <button type="button" class="account-nav__link" @click="handleLogout">Log out</button>
    </template>

    <template v-else>
      <router-link :to="{ name: 'login' }" class="account-nav__link" @click="emit('navigate')">
        Log in
      </router-link>
      <router-link
        :to="{ name: 'login', query: { mode: 'register' } }"
        class="account-nav__link"
        @click="emit('navigate')"
      >
        Create account
      </router-link>
    </template>
  </div>
</template>

<style scoped>
.account-nav {
  font-size: 0.9rem;
}

.account-nav__who {
  margin: 0;
  color: var(--paper);
}

.account-nav__role {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--reclaim);
}

.account-nav__link {
  font-family: var(--font-body);
  font-size: inherit;
  font-weight: 600;
  color: var(--paper);
  text-decoration: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.account-nav__link:hover {
  text-decoration: underline;
}

.account-nav__link.is-active {
  color: var(--reclaim);
}

/* Desktop: slim bar above the main nav */
.account-nav--bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem 0.5rem;
  padding: 0.3rem 0;
}

.account-nav--bar .account-nav__who {
  margin-right: 0.5rem;
}

.account-nav--bar .account-nav__link {
  padding: 0.45rem 0.6rem;
}

/* Mobile and tablet: section at the bottom of the collapsible menu */
.account-nav--menu {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  border-top: 2px solid rgba(237, 238, 228, 0.25);
}

.account-nav__heading {
  margin: 0;
  padding: 0.6rem 1.25rem 0.2rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--kraft);
}

.account-nav--menu .account-nav__who {
  padding: 0.2rem 1.25rem 0.5rem;
}

.account-nav--menu .account-nav__link {
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  text-align: left;
  border-top: 1px solid rgba(237, 238, 228, 0.12);
}
</style>
