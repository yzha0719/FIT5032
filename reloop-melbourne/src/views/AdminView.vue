<script setup>
import { computed } from 'vue'
import { useAuth, ROLE_LABELS } from '../composables/useAuth'
import { useRatings } from '../composables/useRatings'
import { events, isPastEvent } from '../data/events'
import RatingSummary from '../components/RatingSummary.vue'

const { listUsers } = useAuth()
const { getSummary } = useRatings()

const accounts = computed(() => listUsers())

// "1 Volunteer" but "2 Volunteers"
function countLabel(count, singular) {
  return count === 1 ? singular : `${singular}s`
}

const roleCounts = computed(() =>
  Object.entries(ROLE_LABELS).map(([role, label]) => {
    const count = accounts.value.filter((user) => user.role === role).length
    return { role, count, label: countLabel(count, label) }
  }),
)

// Past events only, most recent first. Upcoming events can't be rated yet.
const ratedEvents = computed(() =>
  events
    .filter((event) => isPastEvent(event))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((event) => ({ ...event, summary: getSummary(event.id) })),
)

const totalRatings = computed(() =>
  ratedEvents.value.reduce((sum, event) => sum + event.summary.count, 0),
)

function formatEventDate(date) {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Admin</p>
      <h1>Admin overview</h1>
      <p class="page-intro__lede">Members, volunteers and ratings across ReLoop Melbourne.</p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <div class="admin-stats">
        <div class="stat-block">
          <span class="stat-block__value">{{ accounts.length }}</span>
          <span class="stat-block__label">Accounts</span>
        </div>
        <div v-for="item in roleCounts" :key="item.role" class="stat-block">
          <span class="stat-block__value">{{ item.count }}</span>
          <span class="stat-block__label">{{ item.label }}</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__value">{{ totalRatings }}</span>
          <span class="stat-block__label">Event ratings</span>
        </div>
      </div>

      <div class="admin-block">
        <h2 id="accounts-heading" class="admin-heading">Accounts</h2>
        <!-- Focusable so keyboard users can scroll the table sideways on small screens -->
        <div class="table-wrap" tabindex="0" role="region" aria-labelledby="accounts-heading">
          <table class="admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Account</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in accounts" :key="user.id">
                <td>{{ user.name }}</td>
                <td class="admin-table__nowrap">{{ user.email }}</td>
                <td>
                  <span class="role-badge">{{ ROLE_LABELS[user.role] }}</span>
                </td>
                <td>{{ user.isSeedAccount ? 'Built-in' : 'Registered' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-block">
        <h2 id="ratings-heading" class="admin-heading">Event ratings</h2>
        <div class="table-wrap" tabindex="0" role="region" aria-labelledby="ratings-heading">
          <table class="admin-table">
            <thead>
              <tr>
                <th scope="col">Event</th>
                <th scope="col">Date</th>
                <th scope="col">Suburb</th>
                <th scope="col">Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in ratedEvents" :key="event.id">
                <td>{{ event.title }}</td>
                <td class="admin-table__nowrap">{{ formatEventDate(event.date) }}</td>
                <td>{{ event.suburb }}</td>
                <td>
                  <RatingSummary :average="event.summary.average" :count="event.summary.count" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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

.admin-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem 1rem;
  margin-bottom: 3rem;
}

.admin-block {
  margin-bottom: 3rem;
}

.admin-heading {
  font-size: 1.6rem;
  margin: 0 0 1rem;
}

.table-wrap {
  overflow-x: auto;
  background-color: var(--paper);
  border: 1px solid var(--kraft-dark);
  border-radius: var(--radius);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.admin-table th {
  padding: 0.7rem 0.9rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--paper);
  background-color: var(--ink);
}

.admin-table td {
  padding: 0.7rem 0.9rem;
  vertical-align: middle;
  border-top: 1px solid var(--kraft-dark);
}

.admin-table tbody tr:nth-child(even) {
  background-color: var(--paper-dim);
}

.admin-table__nowrap {
  white-space: nowrap;
}

/* RatingSummary has bottom margin for cards; not needed inside a table cell */
.admin-table :deep(.rating-summary) {
  margin: 0;
  flex-wrap: nowrap;
}

.role-badge {
  display: inline-block;
  padding: 0.15em 0.5em;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  background-color: var(--kraft);
  border-radius: 3px;
}

@media (min-width: 768px) {
  .admin-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 992px) {
  .admin-stats {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
