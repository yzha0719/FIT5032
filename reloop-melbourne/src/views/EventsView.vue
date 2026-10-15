<script setup>
import { computed } from 'vue'
import DataTable from '../components/DataTable.vue'
import RatingSummary from '../components/RatingSummary.vue'
import { useRatings } from '../composables/useRatings'
import { events, isPastEvent } from '../data/events'

const { getSummary } = useRatings()

// Every event with its rating summary attached, newest first by default.
const eventRows = computed(() =>
  events.map((event) => ({
    ...event,
    past: isPastEvent(event),
    summary: getSummary(event.id),
  })),
)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const columns = [
  { key: 'title', label: 'Event', sortable: true, searchable: true },
  { key: 'category', label: 'Category', sortable: true, searchable: true },
  { key: 'suburb', label: 'Suburb', sortable: true, searchable: true },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    nowrap: true,
    value: (row) => formatDate(row.date),
    // Sort on the raw YYYY-MM-DD, not the shown text, so dates order properly.
    sortValue: (row) => row.date,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    value: (row) => (row.past ? 'Past' : 'Upcoming'),
  },
  {
    key: 'rating',
    label: 'Rating',
    sortable: true,
    value: (row) => (row.summary.count ? row.summary.average : 'Not rated'),
    sortValue: (row) => row.summary.average,
  },
  {
    key: 'spots',
    label: 'Spots left',
    sortable: true,
    value: (row) => (row.past ? '—' : row.spotsLeft),
    sortValue: (row) => (row.past ? -1 : row.spotsLeft),
  },
]
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Community directory</p>
      <h1>Workshops &amp; events</h1>
      <p class="page-intro__lede">
        Every repair café, swap meet, workshop and drop-off day. Sort any column, or search by
        event, category or suburb to find something near you.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <DataTable
        :rows="eventRows"
        :columns="columns"
        caption="Workshops and events, with ratings and spots left"
        row-noun="events"
        export-name="reloop-events"
        default-sort-key="date"
        default-sort-direction="desc"
        empty-text="No events match your search. Try a different suburb or category."
      >
        <template #cell-rating="{ row }">
          <RatingSummary :average="row.summary.average" :count="row.summary.count" />
        </template>
        <template #cell-status="{ row }">
          <span class="status-badge" :class="{ 'is-upcoming': !row.past }">
            {{ row.past ? 'Past' : 'Upcoming' }}
          </span>
        </template>
      </DataTable>

      <p class="events-note">
        Been to one of these? <router-link to="/">Rate it on the home page</router-link>. Want to
        help run one? <router-link to="/get-involved">Join as a volunteer</router-link>.
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

.status-badge {
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

.status-badge.is-upcoming {
  color: var(--paper);
  background-color: var(--loop);
}

.events-note {
  margin-top: 1.5rem;
  color: var(--ink-soft);
}

:deep(.rating-summary) {
  margin: 0;
  flex-wrap: nowrap;
}
</style>
