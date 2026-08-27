<script setup>
import { teamMembers } from '../data/team'
import { impactStats } from '../data/impactStats'
import TicketDivider from '../components/TicketDivider.vue'
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">About us</p>
      <h1>A city-wide network,<br />run by locals.</h1>
      <p class="page-intro__lede">
        ReLoop Melbourne is a not-for-profit dedicated to reducing landfill waste, promoting
        recycling literacy, and accelerating the transition to a circular economy across
        underrepresented communities — including low-income households, migrants and refugees,
        social housing residents, and small local businesses.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app two-col">
      <div>
        <h2>Our story</h2>
        <p>
          ReLoop Melbourne started in 2019 as a single repair café in a Coburg community hall. Today
          the network spans repair cafés, swap meets and school programs across six local government
          areas, powered almost entirely by volunteers.
        </p>
      </div>
      <div>
        <h2>Our mission</h2>
        <p>
          We exist to demystify recycling and waste-reduction behaviour, strengthen a
          volunteer-powered network of repair and reuse events, and demonstrate measurable community
          impact to the funders and councils that sustain our work.
        </p>
      </div>
    </div>
  </section>

  <TicketDivider label="Annual impact report" />

  <section class="section section--tight">
    <div class="container-app">
      <div class="stats-grid-about">
        <div v-for="stat in impactStats" :key="stat.id" class="stat-block">
          <span class="stat-block__value"
            >{{ stat.value.toLocaleString('en-AU') }}{{ stat.suffix }}</span
          >
          <span class="stat-block__label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>

  <TicketDivider label="Our team" />

  <section class="section section--tight">
    <div class="container-app">
      <div class="team-grid">
        <article v-for="member in teamMembers" :key="member.id" class="crate-card">
          <span class="crate-card__tag">TEAM</span>
          <h3 class="team-grid__name">{{ member.name }}</h3>
          <p class="team-grid__role">{{ member.role }}</p>
          <p class="team-grid__bio">{{ member.bio }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-intro {
  padding: 3.5rem 0;
}

.page-intro__lede {
  max-width: 62ch;
  color: var(--kraft);
  font-size: 1.05rem;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.stats-grid-about {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem 1rem;
}

.team-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.team-grid__name {
  font-size: 1.1rem;
  margin-top: 0.75rem;
}

.team-grid__role {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  color: var(--loop);
  margin-bottom: 0.6rem;
}

.team-grid__bio {
  font-size: 0.92rem;
  color: var(--ink-soft);
  margin: 0;
}

@media (min-width: 768px) {
  .two-col {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 576px) {
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .stats-grid-about {
    grid-template-columns: repeat(4, 1fr);
  }

  .team-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
