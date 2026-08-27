<script setup>
import { reactive, ref } from 'vue'
import {
  required,
  minLength,
  email as emailValidator,
  runValidators,
} from '../composables/useValidators'

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const errors = reactive({
  name: null,
  email: null,
  message: null,
})

const submitted = ref(false)

function validateField(field) {
  if (field === 'name') {
    errors.name = runValidators(form.name, [required('Name')])
  }
  if (field === 'email') {
    errors.email = runValidators(form.email, [required('Email'), emailValidator()])
  }
  if (field === 'message') {
    errors.message = runValidators(form.message, [required('Message'), minLength('Message', 20)])
  }
}

function submitForm() {
  validateField('name')
  validateField('email')
  validateField('message')

  const hasErrors = Object.values(errors).some(Boolean)
  if (hasErrors) return

  submitted.value = true
  form.name = ''
  form.email = ''
  form.message = ''
  Object.keys(errors).forEach((key) => (errors[key] = null))
}
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Contact &amp; news</p>
      <h1>Talk to the team.</h1>
      <p class="page-intro__lede">
        Questions about an event, a partnership, or something else entirely — send us a message and
        we'll get back to you within two business days.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app two-col">
      <div class="crate-card form-card">
        <span class="crate-card__tag">CONTACT FORM</span>

        <p v-if="submitted" class="form-success">
          Thanks for reaching out — we've received your message.
        </p>

        <form novalidate @submit.prevent="submitForm">
          <div class="field" :class="{ 'has-error': errors.name }">
            <label for="contact-name">Name</label>
            <input
              id="contact-name"
              v-model="form.name"
              type="text"
              @blur="validateField('name')"
            />
            <span v-if="errors.name" class="field__error">{{ errors.name }}</span>
          </div>

          <div class="field" :class="{ 'has-error': errors.email }">
            <label for="contact-email">Email</label>
            <input
              id="contact-email"
              v-model="form.email"
              type="email"
              @blur="validateField('email')"
            />
            <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
          </div>

          <div class="field" :class="{ 'has-error': errors.message }">
            <label for="contact-message">Message</label>
            <textarea
              id="contact-message"
              v-model="form.message"
              rows="5"
              @blur="validateField('message')"
            ></textarea>
            <span class="field__hint">At least 20 characters.</span>
            <span v-if="errors.message" class="field__error">{{ errors.message }}</span>
          </div>

          <button type="submit" class="btn-reloop btn-reloop--primary">Send message</button>
        </form>
      </div>

      <div class="contact-details">
        <h2>Other ways to reach us</h2>
        <dl>
          <dt>General enquiries</dt>
          <dd>hello@reloopmelbourne.org.au</dd>
          <dt>Volunteering</dt>
          <dd>volunteer@reloopmelbourne.org.au</dd>
          <dt>Office</dt>
          <dd>12 Sydney Road, Coburg VIC 3058</dd>
        </dl>
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
  gap: 2rem;
  align-items: start;
}

.form-card {
  padding-top: 2rem;
}

.contact-details dt {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  color: var(--loop);
  margin-top: 1rem;
}

.contact-details dd {
  margin: 0.2rem 0 0;
  font-size: 1rem;
}

@media (min-width: 992px) {
  .two-col {
    grid-template-columns: 3fr 2fr;
  }
}
</style>
