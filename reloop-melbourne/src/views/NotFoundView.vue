<script setup>
// A mistyped address is a dead end unless the page offers somewhere to go, so
// this lists the destinations visitors actually ask for.
const suggestions = [
  { to: '/recycling-hub', label: 'Recycling hub', hint: 'What goes in which bin' },
  { to: '/locator', label: 'Find a drop-off or repair point', hint: 'A map of nearby places' },
  { to: '/events', label: 'Workshops & events', hint: "What's on, and where" },
  { to: '/get-involved', label: 'Get involved', hint: 'Volunteer, donate or partner with us' },
]
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Page not found</p>
      <h1>That page<br />isn't here.</h1>
      <p class="page-intro__lede">
        The address may have been mistyped, or the page may have moved since you last visited.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <h2 class="notfound-heading">Try one of these</h2>
      <ul class="suggestions">
        <li v-for="item in suggestions" :key="item.to">
          <router-link :to="item.to" class="suggestion">
            <span class="suggestion__label">{{ item.label }}</span>
            <span class="suggestion__hint">{{ item.hint }}</span>
          </router-link>
        </li>
      </ul>
      <p class="notfound-help">
        Still can't find it? <router-link to="/contact">Contact the team</router-link>.
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

.notfound-heading {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.suggestions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
}

.suggestion {
  display: block;
  min-height: 44px;
  padding: 0.9rem 1rem;
  text-decoration: none;
  color: var(--ink);
  background-color: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--radius);
}

.suggestion:hover,
.suggestion:focus-visible {
  background-color: var(--paper-dim);
}

.suggestion__label {
  display: block;
  font-weight: 700;
}

.suggestion__hint {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.88rem;
  color: var(--ink-soft);
}

.notfound-help {
  color: var(--ink-soft);
}

@media (min-width: 576px) {
  .suggestions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
