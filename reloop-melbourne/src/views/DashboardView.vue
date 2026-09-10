<script setup>
import { computed } from 'vue'
import { useAuth, ROLE_LABELS } from '../composables/useAuth'

const { currentUser, hasRole } = useAuth()

// The route guard makes sure someone is logged in when this page opens, but
// currentUser becomes null the moment they log out, so the template checks it.
const firstName = computed(() => currentUser.value?.name.split(' ')[0] ?? '')

// Each section lists the roles that see it. Volunteers also get the recycling
// section, because a volunteer can do everything a member can.
const sections = [
  {
    id: 'recycling',
    roles: ['member', 'volunteer'],
    tag: 'RECYCLING',
    title: 'Sort your waste',
    text: 'Look up what goes in which bin, or read a practical guide from the Learning Centre.',
    links: [
      { to: { name: 'recycling-hub' }, label: 'A-Z recycling guide' },
      { to: { name: 'learning-centre' }, label: 'Learning Centre' },
    ],
  },
  {
    id: 'become-volunteer',
    roles: ['member'],
    tag: 'GET INVOLVED',
    title: 'Want to help out?',
    text: 'Volunteers run our repair cafés and swap meets. Get in touch and we can switch your account to a volunteer account.',
    links: [
      { to: { name: 'get-involved' }, label: 'About volunteering' },
      { to: { name: 'contact' }, label: 'Contact us' },
    ],
  },
  {
    id: 'volunteer',
    roles: ['volunteer'],
    tag: 'VOLUNTEER',
    title: 'Your volunteering',
    text: 'See which repair café and swap meet sessions need a hand.',
    links: [{ to: { name: 'volunteer-shifts' }, label: 'Volunteer shifts' }],
  },
  {
    id: 'admin',
    roles: ['admin'],
    tag: 'ADMIN',
    title: 'Admin tools',
    text: 'Check members, volunteers and activity across ReLoop Melbourne.',
    links: [
      { to: { name: 'admin' }, label: 'Admin overview' },
      { to: { name: 'volunteer-shifts' }, label: 'Volunteer shifts' },
    ],
  },
]

const visibleSections = computed(() => sections.filter((section) => hasRole(...section.roles)))
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">My account</p>
      <h1>Welcome, {{ firstName }}.</h1>
      <p v-if="currentUser" class="page-intro__lede">
        Here's what you can do with your {{ ROLE_LABELS[currentUser.role] }} account.
      </p>
    </div>
  </section>

  <section v-if="currentUser" class="section">
    <div class="container-app dashboard-grid">
      <article class="crate-card dashboard-card">
        <span class="crate-card__tag">YOUR ACCOUNT</span>
        <h2 class="dashboard-card__title">Account details</h2>
        <dl class="account-details">
          <dt>Name</dt>
          <dd>{{ currentUser.name }}</dd>
          <dt>Email</dt>
          <dd>{{ currentUser.email }}</dd>
          <dt>Account type</dt>
          <dd>{{ ROLE_LABELS[currentUser.role] }}</dd>
        </dl>
      </article>

      <article
        v-for="section in visibleSections"
        :key="section.id"
        class="crate-card dashboard-card"
      >
        <span class="crate-card__tag">{{ section.tag }}</span>
        <h2 class="dashboard-card__title">{{ section.title }}</h2>
        <p>{{ section.text }}</p>
        <div class="dashboard-card__links">
          <router-link
            v-for="link in section.links"
            :key="link.label"
            :to="link.to"
            class="btn-reloop btn-reloop--outline btn-reloop--sm"
          >
            {{ link.label }}
          </router-link>
        </div>
      </article>
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.75rem;
}

.dashboard-card {
  padding-top: 2rem;
}

.dashboard-card__title {
  font-size: 1.4rem;
  margin: 0.25rem 0 0.75rem;
}

.dashboard-card__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.account-details {
  margin: 0;
}

.account-details dt {
  margin-top: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--loop);
}

.account-details dt:first-child {
  margin-top: 0;
}

.account-details dd {
  margin: 0.15rem 0 0;
  overflow-wrap: anywhere;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
