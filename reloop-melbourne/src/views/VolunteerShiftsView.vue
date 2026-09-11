<script setup>
import { computed, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useShifts } from '../composables/useShifts'
import { events, isPastEvent } from '../data/events'
import { shifts } from '../data/shifts'

const { hasRole } = useAuth()
const { myShifts, spotsLeft, isSignedUp, findClash, signUp, cancel } = useShifts()

// Admins can open this page too (to see how shifts are filling up) but only
// volunteers sign up.
const isVolunteer = computed(() => hasRole('volunteer'))

const eventsById = new Map(events.map((event) => [event.id, event]))

// Upcoming events that need volunteers, each with its shifts in time order.
const upcomingEvents = events
  .filter((event) => !isPastEvent(event))
  .map((event) => ({
    ...event,
    shifts: shifts
      .filter((shift) => shift.eventId === event.id)
      .sort((a, b) => a.start.localeCompare(b.start)),
  }))
  .filter((event) => event.shifts.length)

// Feedback shown under the shift the user just acted on.
const messages = reactive({})

function handleSignUp(shift) {
  const result = signUp(shift.id)
  messages[shift.id] = result.ok
    ? { text: "You're signed up. Thanks for helping out!", isError: false }
    : { text: result.error, isError: true }
}

function handleCancel(shift) {
  const result = cancel(shift.id)
  messages[shift.id] = result.ok
    ? { text: 'Shift cancelled.', isError: false }
    : { text: result.error, isError: true }
}

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const bookedHours = computed(
  () => myShifts.value.reduce((sum, s) => sum + toMinutes(s.end) - toMinutes(s.start), 0) / 60,
)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// 13:30 -> 1:30 pm
function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours < 12 ? 'am' : 'pm'
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

function timeRange(shift) {
  return `${formatTime(shift.start)} – ${formatTime(shift.end)}`
}

function spotsText(shift) {
  const left = spotsLeft(shift)
  if (left === 0) return 'Full'
  return `${left} of ${shift.volunteersNeeded} ${shift.volunteersNeeded === 1 ? 'spot' : 'spots'} left`
}
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Volunteers</p>
      <h1>Volunteer shifts</h1>
      <p class="page-intro__lede">
        Repair café, swap meet and drop-off sessions that need a hand. Sign up for as many as you
        like, as long as the times don't overlap.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <div v-if="isVolunteer" class="crate-card my-shifts">
        <span class="crate-card__tag">MY SHIFTS</span>
        <template v-if="myShifts.length">
          <h2 class="my-shifts__title">
            You're booked for {{ myShifts.length }} {{ myShifts.length === 1 ? 'shift' : 'shifts' }}
          </h2>
          <p class="my-shifts__hours">{{ bookedHours }} hours in total</p>
          <ul class="my-shifts__list">
            <li v-for="shift in myShifts" :key="shift.id">
              <strong>{{ formatDate(eventsById.get(shift.eventId).date) }}, {{ timeRange(shift) }}</strong>
              <span class="my-shifts__detail">
                {{ shift.task }} at {{ eventsById.get(shift.eventId).title }}
              </span>
            </li>
          </ul>
        </template>
        <template v-else>
          <h2 class="my-shifts__title">No shifts booked yet</h2>
          <p class="my-shifts__empty">
            Pick a shift below. If two shifts overlap, we'll let you know before you book.
          </p>
        </template>
      </div>
      <p v-else class="admin-note">
        You're viewing shifts as an administrator. Volunteers sign up from their own accounts.
      </p>

      <div v-if="upcomingEvents.length" class="shift-events">
        <article v-for="event in upcomingEvents" :key="event.id" class="crate-card shift-event">
          <span class="crate-card__tag">{{ event.category.toUpperCase() }}</span>
          <h2 class="shift-event__title">{{ event.title }}</h2>
          <p class="shift-event__meta">{{ formatDate(event.date) }} &middot; {{ event.suburb }}</p>

          <ul class="shift-list">
            <li
              v-for="shift in event.shifts"
              :key="shift.id"
              class="shift"
              :class="{ 'is-mine': isSignedUp(shift.id) }"
            >
              <div class="shift__info">
                <p class="shift__task">{{ shift.task }}</p>
                <p class="shift__time">{{ timeRange(shift) }}</p>
              </div>

              <p class="shift__spots" :class="{ 'is-full': spotsLeft(shift) === 0 }">
                {{ spotsText(shift) }}
              </p>

              <div v-if="isVolunteer" class="shift__action">
                <template v-if="isSignedUp(shift.id)">
                  <span class="shift__badge">✓ You're on this shift</span>
                  <button
                    type="button"
                    class="btn-reloop btn-reloop--outline btn-reloop--sm"
                    :aria-label="`Cancel your ${shift.task} shift`"
                    @click="handleCancel(shift)"
                  >
                    Cancel
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="btn-reloop btn-reloop--primary btn-reloop--sm"
                    :disabled="spotsLeft(shift) === 0 || !!findClash(shift)"
                    :aria-label="`Sign up for ${shift.task}, ${timeRange(shift)}`"
                    @click="handleSignUp(shift)"
                  >
                    Sign up
                  </button>
                  <p v-if="findClash(shift)" class="shift__note">
                    Overlaps with your "{{ findClash(shift).task }}" shift
                  </p>
                </template>
              </div>

              <p
                class="shift__message"
                :class="{ 'is-error': messages[shift.id]?.isError }"
                aria-live="polite"
              >
                {{ messages[shift.id]?.text }}
              </p>
            </li>
          </ul>
        </article>
      </div>
      <p v-else class="admin-note">No upcoming shifts right now. Check back soon.</p>
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

.my-shifts {
  height: auto;
  padding-top: 2rem;
  margin-bottom: 2.5rem;
}

.my-shifts__title {
  font-size: 1.4rem;
  margin: 0.25rem 0 0.5rem;
}

.my-shifts__hours {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.my-shifts__list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding-left: 1.2rem;
}

.my-shifts__detail {
  display: block;
  color: var(--ink-soft);
}

.my-shifts__empty {
  margin: 0;
}

.admin-note {
  margin-bottom: 2rem;
  color: var(--ink-soft);
}

.shift-events {
  display: grid;
  gap: 2rem;
}

.shift-event {
  height: auto;
  padding-top: 2rem;
}

.shift-event__title {
  font-size: 1.4rem;
  margin: 0.25rem 0;
}

.shift-event__meta {
  margin-bottom: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.shift-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.shift {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.4rem 1rem;
  align-items: center;
  padding: 0.9rem 0;
  border-top: 1px dashed var(--kraft-dark);
}

.shift.is-mine {
  padding-left: 0.9rem;
  box-shadow: inset 4px 0 0 var(--loop);
}

.shift__task,
.shift__time,
.shift__spots {
  margin: 0;
}

.shift__task {
  font-weight: 700;
}

.shift__time {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.shift__spots {
  font-size: 0.9rem;
}

.shift__spots.is-full {
  font-weight: 700;
  color: var(--reclaim-dark);
}

.shift__action {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

/* 44px buttons, so they're easy to hit */
.shift__action .btn-reloop {
  min-height: 44px;
}

.shift__badge {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--loop);
}

.shift__note {
  flex-basis: 100%;
  margin: 0;
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.shift__message {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--loop);
}

.shift__message.is-error {
  color: var(--reclaim-dark);
}

@media (min-width: 768px) {
  .shift {
    grid-template-columns: 2fr 1fr minmax(12rem, auto);
  }

  .shift__action {
    justify-content: flex-end;
  }

  .shift__note {
    text-align: right;
  }
}
</style>
