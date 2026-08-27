<script setup>
import { reactive, ref } from 'vue'
import { useLocalStorageState } from '../composables/useLocalStorageState'
import {
  required,
  minLength,
  email as emailValidator,
  numberRange,
  runValidators,
} from '../composables/useValidators'

/* Volunteer sign-up form — validation types: required, minLength, email */
const volunteerForm = reactive({
  fullName: '',
  email: '',
  interestArea: '',
  message: '',
})

const volunteerErrors = reactive({
  fullName: null,
  email: null,
  interestArea: null,
})

const volunteerSubmitted = ref(false)
const volunteerSignup = useLocalStorageState('reloop:volunteer-signup', null)
const interestAreas = ['Repair café', 'Swap meets & events', 'Schools program', 'Admin & comms']

function validateVolunteerField(field) {
  if (field === 'fullName') {
    volunteerErrors.fullName = runValidators(volunteerForm.fullName, [
      required('Full name'),
      minLength('Full name', 2),
    ])
  }
  if (field === 'email') {
    volunteerErrors.email = runValidators(volunteerForm.email, [
      required('Email'),
      emailValidator(),
    ])
  }
  if (field === 'interestArea') {
    volunteerErrors.interestArea = runValidators(volunteerForm.interestArea, [
      required('Interest area'),
    ])
  }
}

function submitVolunteerForm() {
  validateVolunteerField('fullName')
  validateVolunteerField('email')
  validateVolunteerField('interestArea')

  const hasErrors = Object.values(volunteerErrors).some(Boolean)
  if (hasErrors) return

  volunteerSignup.value = {
    fullName: volunteerForm.fullName,
    interestArea: volunteerForm.interestArea,
    submittedAt: new Date().toISOString(),
  }
  volunteerSubmitted.value = true
  volunteerForm.fullName = ''
  volunteerForm.email = ''
  volunteerForm.interestArea = ''
  volunteerForm.message = ''
  Object.keys(volunteerErrors).forEach((key) => (volunteerErrors[key] = null))
}

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
        <h2 class="form-card__title">Sign up to volunteer</h2>

        <p v-if="volunteerSubmitted" class="form-success">
          Thanks — we've saved your details and a coordinator will be in touch about your first
          session.
        </p>

        <form novalidate @submit.prevent="submitVolunteerForm">
          <div class="field" :class="{ 'has-error': volunteerErrors.fullName }">
            <label for="volunteer-name">Full name</label>
            <input
              id="volunteer-name"
              v-model="volunteerForm.fullName"
              type="text"
              @blur="validateVolunteerField('fullName')"
            />
            <span v-if="volunteerErrors.fullName" class="field__error">{{
              volunteerErrors.fullName
            }}</span>
          </div>

          <div class="field" :class="{ 'has-error': volunteerErrors.email }">
            <label for="volunteer-email">Email</label>
            <input
              id="volunteer-email"
              v-model="volunteerForm.email"
              type="email"
              @blur="validateVolunteerField('email')"
            />
            <span v-if="volunteerErrors.email" class="field__error">{{
              volunteerErrors.email
            }}</span>
          </div>

          <div class="field" :class="{ 'has-error': volunteerErrors.interestArea }">
            <label for="volunteer-area">Where would you like to help?</label>
            <select
              id="volunteer-area"
              v-model="volunteerForm.interestArea"
              @blur="validateVolunteerField('interestArea')"
            >
              <option value="" disabled>Choose an area</option>
              <option v-for="area in interestAreas" :key="area" :value="area">{{ area }}</option>
            </select>
            <span v-if="volunteerErrors.interestArea" class="field__error">{{
              volunteerErrors.interestArea
            }}</span>
          </div>

          <div class="field">
            <label for="volunteer-message">Anything we should know? (optional)</label>
            <textarea id="volunteer-message" v-model="volunteerForm.message" rows="3"></textarea>
          </div>

          <button type="submit" class="btn-reloop btn-reloop--primary">Join as a volunteer</button>
          <p v-if="volunteerSignup" class="form-card__count">
            You're signed up as a volunteer for "{{ volunteerSignup.interestArea }}" — see you soon.
          </p>
        </form>
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

@media (min-width: 992px) {
  .two-col {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
