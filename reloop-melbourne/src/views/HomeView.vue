<script setup>
import TicketDivider from '../components/TicketDivider.vue'
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
        <div class="stat-block">
          <span class="stat-block__value">12,406</span>
          <span class="stat-block__label">KG diverted from landfill</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__value">38</span>
          <span class="stat-block__label">Partner sites</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__value">1,900+</span>
          <span class="stat-block__label">Community members</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__value">215</span>
          <span class="stat-block__label">Workshops run</span>
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
        <article class="crate-card">
          <span class="crate-card__tag">REPAIR</span>
          <h3 class="event-card__title">Repair Café — small appliances</h3>
          <p class="event-card__meta">Sat 30 Aug &middot; Coburg</p>
          <p class="event-card__spots"><strong>6</strong> spots left</p>
        </article>
        <article class="crate-card">
          <span class="crate-card__tag">SWAP</span>
          <h3 class="event-card__title">Kids' Clothing Swap Meet</h3>
          <p class="event-card__meta">Sun 6 Sep &middot; Preston</p>
          <p class="event-card__spots"><strong>14</strong> spots left</p>
        </article>
        <article class="crate-card">
          <span class="crate-card__tag">WORKSHOP</span>
          <h3 class="event-card__title">Composting 101 Workshop</h3>
          <p class="event-card__meta">Wed 9 Sep &middot; Brunswick</p>
          <p class="event-card__spots"><strong>2</strong> spots left</p>
        </article>
      </div>
    </div>
  </section>

  <TicketDivider label="From the learning centre" />

  <section class="section section--tight">
    <div class="container-app">
      <div class="card-grid card-grid--wide">
        <article class="crate-card blog-card">
          <span class="crate-card__tag">RECYCLING BASICS</span>
          <h3 class="blog-card__title">
            Why one greasy pizza box can contaminate a whole truckload
          </h3>
          <p class="blog-card__excerpt">
            A short guide to the most common contamination mistakes residents make, and how a single
            bin can affect an entire collection run.
          </p>
          <p class="blog-card__meta">18 Jul 2026 &middot; 4 min read</p>
        </article>
        <article class="crate-card blog-card">
          <span class="crate-card__tag">COMMUNITY</span>
          <h3 class="blog-card__title">What actually happens at a repair café</h3>
          <p class="blog-card__excerpt">
            From toasters to torn jackets — a first-timer's walkthrough of what to bring, what to
            expect, and how volunteers decide what can be saved.
          </p>
          <p class="blog-card__meta">2 Jul 2026 &middot; 5 min read</p>
        </article>
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

.blog-card {
  display: flex;
  flex-direction: column;
}

.blog-card__title {
  font-size: 1.1rem;
  margin-top: 0.75rem;
}

.blog-card__excerpt {
  font-size: 0.92rem;
  color: var(--ink-soft);
  flex: 1;
}

.blog-card__meta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--chalk);
  margin: 0;
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
