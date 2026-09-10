<script setup>
import { reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import {
  required,
  email as emailValidator,
  numberRange,
  runValidators,
} from '../composables/useValidators'

/* Volunteering goes through a volunteer account (BR C.2), so there is one way
   to sign up instead of a separate form on this page. */
const { currentUser, isAuthenticated, hasRole } = useAuth()
const interestAreas = ['Repair café', 'Swap meets & events', 'Schools program', 'Admin & comms']

/* Donation form — validation types: required, email, numberRange */
const donationForm = reactive({
  donorName: '',
  email: '',
  amount: '',
})

const donationErrors = reactive({
  donorName: null,
  email: null,
  amount: null,
})

const donationSubmitted = ref(false)

function validateDonationField(field) {
  if (field === 'donorName') {
    donationErrors.donorName = runValidators(donationForm.donorName, [required('Name')])
  }
  if (field === 'email') {
    donationErrors.email = runValidators(donationForm.email, [required('Email'), emailValidator()])
  }
  if (field === 'amount') {
    donationErrors.amount = runValidators(donationForm.amount, [
      required('Donation amount'),
      numberRange('Donation amount', 5, 10000),
    ])
  }
}

function submitDonationForm() {
  validateDonationField('donorName')
  validateDonationField('email')
  validateDonationField('amount')

  const hasErrors = Object.values(donationErrors).some(Boolean)
  if (hasErrors) return

  donationSubmitted.value = true
  donationForm.donorName = ''
  donationForm.email = ''
  donationForm.amount = ''
  Object.keys(donationErrors).forEach((key) => (donationErrors[key] = null))
}
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Get involved</p>
      <h1>Give your time,<br />or give what you can.</h1>
      <p class="page-intro__lede">
        Every repair café, swap meet and school session runs on volunteers and community donations.
        Here's how to jump in.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app two-col">
      <div class="crate-card form-card">
        <span class="crate-card__tag">VOLUNTEER</span>
        <h2 class="form-card__title">Volunteer with us</h2>

        <template v-if="hasRole('volunteer')">
          <p>
            You're registered as a volunteer, {{ currentUser.name }}. Thanks for being part of the
            crew.
          </p>
          <router-link :to="{ name: 'volunteer-shifts' }" class="btn-reloop btn-reloop--primary">
            See volunteer shifts
          </router-link>
        </template>

        <template v-else>
          <p>
            Volunteers keep our repair cafés, swap meets and school sessions running. No experience
            needed. You can help with:
          </p>
          <ul class="volunteer-areas">
            <li v-for="area in interestAreas" :key="area">{{ area }}</li>
          </ul>

          <template v-if="!isAuthenticated">
            <router-link
              :to="{ name: 'login', query: { mode: 'register', role: 'volunteer' } }"
              class="btn-reloop btn-reloop--primary"
            >
              Create a volunteer account
            </router-link>
            <p class="form-card__count">
              Already have an account?
              <router-link :to="{ name: 'login', query: { redirect: '/get-involved' } }"
                >Log in</router-link
              >
            </p>
          </template>

          <p v-else-if="hasRole('member')" class="form-card__count">
            You're signed in with a Community Member account. Want to volunteer too?
            <router-link to="/contact">Get in touch</router-link> and we'll switch your account
            over.
          </p>
        </template>
      </div>

      <div class="crate-card form-card">
        <span class="crate-card__tag">DONATE</span>
        <h2 class="form-card__title">Make a donation</h2>

        <p v-if="donationSubmitted" class="form-success">
          Thank you for supporting ReLoop Melbourne! (This is a design-stage demo — no payment is
          actually processed.)
        </p>

        <form novalidate @submit.prevent="submitDonationForm">
          <div class="field" :class="{ 'has-error': donationErrors.donorName }">
            <label for="donation-name">Your name</label>
            <input
              id="donation-name"
              v-model="donationForm.donorName"
              type="text"
              @blur="validateDonationField('donorName')"
            />
            <span v-if="donationErrors.donorName" class="field__error">{{
              donationErrors.donorName
            }}</span>
          </div>

          <div class="field" :class="{ 'has-error': donationErrors.email }">
            <label for="donation-email">Email</label>
            <input
              id="donation-email"
              v-model="donationForm.email"
              type="email"
              @blur="validateDonationField('email')"
            />
            <span v-if="donationErrors.email" class="field__error">{{ donationErrors.email }}</span>
          </div>

          <div class="field" :class="{ 'has-error': donationErrors.amount }">
            <label for="donation-amount">Donation amount (AUD)</label>
            <input
              id="donation-amount"
              v-model="donationForm.amount"
              type="number"
              min="5"
              max="10000"
              @blur="validateDonationField('amount')"
            />
            <span class="field__hint">Between $5 and $10,000.</span>
            <span v-if="donationErrors.amount" class="field__error">{{
              donationErrors.amount
            }}</span>
          </div>

          <button type="submit" class="btn-reloop btn-reloop--primary">Donate</button>
        </form>
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

.two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}

.form-card {
  padding-top: 2rem;
}

.form-card__title {
  font-size: 1.4rem;
  margin: 0.75rem 0 1.25rem;
}

.form-card__count {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
  margin: 0.9rem 0 0;
}

.volunteer-areas {
  display: grid;
  gap: 0.35rem;
  margin: 0 0 1.5rem;
  padding-left: 1.2rem;
}

@media (min-width: 992px) {
  .two-col {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
