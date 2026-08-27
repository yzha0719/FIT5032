<script setup>
import { ref, onMounted } from 'vue'
import { impactStats } from '../data/impactStats'
import { upcomingEvents } from '../data/events'
import { blogPosts } from '../data/blogPosts'
import TicketDivider from '../components/TicketDivider.vue'
import BlogCard from '../components/BlogCard.vue'

// Reactive display values that animate from 0 up to each stat's real value.
// This is what makes the numbers driven by src/data/impactStats.js (BR B.2)
// instead of hard-coded text.
const displayValues = ref(impactStats.map(() => 0))

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  impactStats.forEach((stat, index) => {
    if (prefersReducedMotion) {
      displayValues.value[index] = stat.value
      return
    }

    const duration = 1200
    const start = performance.now()

    function step(now) {
      const progress = Math.min((now - start) / duration, 1)
      displayValues.value[index] = Math.round(stat.value * progress)
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  })
})

const featuredEvents = upcomingEvents.slice(0, 3)
const featuredPosts = blogPosts.slice(0, 2)
</script>

<template>
  <section class="hero bg-ink">
    <div class="container-app hero__inner">
      <p class="eyebrow">Melbourne &middot; circular economy</p>
      <h1>Keep it in<br />circulation.</h1>
      <p class="hero__lede">
        ReLoop Melbourne connects residents, volunteers and local partners around one shared goal —
        keeping useful materials in use, and out of landfill.
      </p>
      <div class="hero__ctas">
        <router-link to="/recycling-hub" class="btn-reloop btn-reloop--primary">
          Find a recycling point
        </router-link>
        <router-link to="/get-involved" class="btn-reloop btn-reloop--outline hero__cta-outline">
          Become a volunteer
        </router-link>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <p class="eyebrow">Our impact so far</p>
      <div class="stats-grid">
        <div v-for="(stat, index) in impactStats" :key="stat.id" class="stat-block">
          <span class="stat-block__value"
            >{{ displayValues[index].toLocaleString('en-AU') }}{{ stat.suffix }}</span
          >
          <span class="stat-block__label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>

  <TicketDivider label="Upcoming near you" />

  <section class="section section--tight">
    <div class="container-app">
      <div class="section-heading">
        <h2>Workshops &amp; swap events</h2>
        <router-link to="/get-involved" class="section-heading__link">See all &rarr;</router-link>
      </div>
      <div class="card-grid">
        <article v-for="event in featuredEvents" :key="event.id" class="crate-card">
          <span class="crate-card__tag">{{ event.category.toUpperCase() }}</span>
          <h3 class="event-card__title">{{ event.title }}</h3>
          <p class="event-card__meta">
            {{
              new Date(event.date).toLocaleDateString('en-AU', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
            }}
            &middot; {{ event.suburb }}
          </p>
          <p class="event-card__spots">
            <strong>{{ event.spotsLeft }}</strong> spots left
          </p>
        </article>
      </div>
    </div>
  </section>

  <TicketDivider label="From the learning centre" />

  <section class="section section--tight">
    <div class="container-app">
      <div class="card-grid card-grid--wide">
        <BlogCard v-for="post in featuredPosts" :key="post.id" :post="post" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero__inner {
  padding: 4.5rem 1.25rem 3.5rem;
  max-width: 760px;
}

.hero__lede {
  font-size: 1.1rem;
  color: var(--kraft);
  max-width: 46ch;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

.hero__cta-outline {
  border-color: var(--paper);
  color: var(--paper);
}

.hero__cta-outline:hover {
  background-color: var(--paper);
  color: var(--ink);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem 1rem;
  margin-top: 1.25rem;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.section-heading__link {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--loop);
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.event-card__title {
  font-size: 1.15rem;
  margin-top: 0.75rem;
}

.event-card__meta {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--ink-soft);
  margin-bottom: 0.75rem;
}

.event-card__spots {
  margin: 0;
  font-size: 0.9rem;
}

@media (min-width: 576px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .card-grid--wide {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
