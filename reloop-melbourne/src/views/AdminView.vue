<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import DataTable from '../components/DataTable.vue'
import RatingSummary from '../components/RatingSummary.vue'
import { useAuth, ROLE_LABELS } from '../composables/useAuth'
import { useEmail } from '../composables/useEmail'
import { useRatings } from '../composables/useRatings'
import { events, isPastEvent } from '../data/events'
import { maxLength, minLength, required, runValidators } from '../composables/useValidators'

const { currentUser, fetchUsers } = useAuth()
const { emailMembers } = useEmail()
const { getSummary } = useRatings()

/* BR D.2: bulk email composer */

const emailForm = reactive({ audience: 'volunteer', subject: '', message: '' })
const emailErrors = reactive({ subject: null, message: null })
const emailStatus = ref(null)
const isSending = ref(false)

const emailRules = {
  subject: [required('Subject'), minLength('Subject', 4), maxLength('Subject', 120)],
  message: [required('Message'), minLength('Message', 20), maxLength('Message', 4000)],
}

function validateEmailField(field) {
  emailErrors[field] = runValidators(emailForm[field], emailRules[field])
}

async function sendBulkEmail() {
  emailStatus.value = null
  Object.keys(emailRules).forEach(validateEmailField)
  if (Object.values(emailErrors).some(Boolean)) return

  isSending.value = true
  const result = await emailMembers({ ...emailForm })
  isSending.value = false

  if (!result.ok) {
    emailStatus.value = { text: result.error, isError: true }
    return
  }
  emailStatus.value = {
    text: `Sent to ${result.recipients} ${result.recipients === 1 ? 'person' : 'people'}, with the recipient list attached as a CSV.`,
    isError: false,
  }
  emailForm.subject = ''
  emailForm.message = ''
}

// Accounts now come from Firestore, so they arrive after the page renders.
const accounts = ref([])
const accountsError = ref(null)

async function loadAccounts() {
  try {
    accounts.value = await fetchUsers()
    accountsError.value = null
  } catch {
    accountsError.value = 'Could not load accounts. Check your connection and try again.'
  }
}

onMounted(loadAccounts)
// Reload if the signed-in user changes (for example after a page refresh
// resolves the session).
watch(currentUser, loadAccounts)

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

// Past events only. Upcoming events can't be rated yet.
const ratedEvents = computed(() =>
  events
    .filter((event) => isPastEvent(event))
    .map((event) => ({ ...event, summary: getSummary(event.id) })),
)

const totalRatings = computed(() =>
  ratedEvents.value.reduce((sum, event) => sum + event.summary.count, 0),
)

function formatDate(date) {
  if (!date) return '—'
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const accountColumns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true, nowrap: true },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    searchable: true,
    value: (row) => ROLE_LABELS[row.role],
  },
  {
    key: 'createdAt',
    label: 'Joined',
    sortable: true,
    nowrap: true,
    value: (row) => formatDate(row.createdAt),
    sortValue: (row) => row.createdAt?.getTime() ?? 0,
  },
]

const ratingColumns = [
  { key: 'title', label: 'Event', sortable: true, searchable: true },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    nowrap: true,
    value: (row) => new Date(row.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
    sortValue: (row) => row.date,
  },
  { key: 'suburb', label: 'Suburb', sortable: true, searchable: true },
  {
    key: 'rating',
    label: 'Average',
    sortable: true,
    value: (row) => row.summary.average,
    sortValue: (row) => row.summary.average,
  },
  {
    key: 'count',
    label: 'Ratings',
    sortable: true,
    value: (row) => row.summary.count,
    sortValue: (row) => row.summary.count,
  },
]
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
        <h2 class="admin-heading">Email members</h2>
        <div class="crate-card email-card">
          <span class="crate-card__tag">BULK EMAIL</span>
          <p
            v-if="emailStatus"
            class="email-status"
            :class="{ 'is-error': emailStatus.isError }"
            role="status"
          >
            {{ emailStatus.text }}
          </p>

          <form novalidate @submit.prevent="sendBulkEmail">
            <div class="field">
              <label for="email-audience">Send to</label>
              <select id="email-audience" v-model="emailForm.audience">
                <option value="volunteer">Volunteers</option>
                <option value="member">Community members</option>
                <option value="all">Everyone with an account</option>
              </select>
            </div>

            <div class="field" :class="{ 'has-error': emailErrors.subject }">
              <label for="email-subject">Subject</label>
              <input
                id="email-subject"
                v-model="emailForm.subject"
                type="text"
                maxlength="120"
                @blur="validateEmailField('subject')"
              />
              <span v-if="emailErrors.subject" class="field__error">{{ emailErrors.subject }}</span>
            </div>

            <div class="field" :class="{ 'has-error': emailErrors.message }">
              <label for="email-message">Message</label>
              <textarea
                id="email-message"
                v-model="emailForm.message"
                rows="5"
                maxlength="4000"
                @blur="validateEmailField('message')"
              ></textarea>
              <span class="field__hint">
                Everyone receives their own copy, with the recipient list attached as a CSV.
              </span>
              <span v-if="emailErrors.message" class="field__error">{{ emailErrors.message }}</span>
            </div>

            <button
              type="submit"
              class="btn-reloop btn-reloop--primary"
              :disabled="isSending"
              @mousedown.prevent
            >
              {{ isSending ? 'Sending…' : 'Send email' }}
            </button>
          </form>
        </div>
      </div>

      <div class="admin-block">
        <h2 class="admin-heading">Accounts</h2>
        <p v-if="accountsError" class="admin-error" role="alert">{{ accountsError }}</p>
        <DataTable
          :rows="accounts"
          :columns="accountColumns"
          caption="All accounts with their role and the date they joined"
          row-noun="accounts"
          export-name="reloop-accounts"
          default-sort-key="name"
          empty-text="No accounts match your search."
        >
          <template #cell-role="{ row }">
            <span class="role-badge">{{ ROLE_LABELS[row.role] }}</span>
          </template>
        </DataTable>
      </div>

      <div class="admin-block">
        <h2 class="admin-heading">Event ratings</h2>
        <DataTable
          :rows="ratedEvents"
          :columns="ratingColumns"
          caption="Past events with their average rating and number of ratings"
          row-noun="events"
          export-name="reloop-event-ratings"
          default-sort-key="date"
          default-sort-direction="desc"
          empty-text="No events match your search."
        >
          <template #cell-rating="{ row }">
            <RatingSummary :average="row.summary.average" :count="row.summary.count" />
          </template>
        </DataTable>
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

.email-card {
  height: auto;
  max-width: 48rem;
  padding-top: 2rem;
}

.email-status {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--paper);
  background-color: var(--loop);
  border-radius: var(--radius);
}

.email-status.is-error {
  color: var(--reclaim-dark);
  background-color: var(--paper);
  border: 2px solid var(--reclaim-dark);
}

.admin-error {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--reclaim-dark);
  background-color: var(--paper);
  border: 2px solid var(--reclaim-dark);
  border-radius: var(--radius);
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

/* RatingSummary has bottom margin for cards; not needed inside a table cell */
:deep(.rating-summary) {
  margin: 0;
  flex-wrap: nowrap;
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
