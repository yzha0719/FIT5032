<script setup>
import { computed, ref } from 'vue'

/* BR F.1: documentation for the public open-data API, with a console that
   sends real requests to it. Councils and partner sites can read our event
   listings instead of asking us to email a spreadsheet that goes stale. */

const endpoints = [
  {
    path: '/api/events',
    summary: 'Workshops, swap meets, repair sessions and drop-off days.',
    parameters: [
      { name: 'suburb', detail: 'Match one suburb, e.g. Preston. Case does not matter.' },
      { name: 'category', detail: 'Swap, Repair, Workshop or Drop-off.' },
      { name: 'when', detail: 'all (default), upcoming or past.' },
      { name: 'limit', detail: 'How many to return: 1 to 100, 20 by default.' },
    ],
  },
  {
    path: '/api/locations',
    summary: 'Drop-off points, repair cafés and swap shops, with coordinates.',
    parameters: [
      { name: 'suburb', detail: 'Match one suburb, e.g. Reservoir.' },
      { name: 'type', detail: 'Recycling point, Repair café, Swap & op shop or E-waste drop-off.' },
      { name: 'accepts', detail: 'Match part of an accepted item, e.g. bikes or batteries.' },
      { name: 'limit', detail: 'How many to return: 1 to 100, 20 by default.' },
    ],
  },
]

/* The console */

const resource = ref('events')
const suburb = ref('')
const limit = ref('5')
const response = ref(null)
const isLoading = ref(false)

const requestUrl = computed(() => {
  const params = new URLSearchParams()
  if (suburb.value.trim()) params.set('suburb', suburb.value.trim())
  if (limit.value) params.set('limit', limit.value)
  const query = params.toString()
  return `/api/${resource.value}${query ? `?${query}` : ''}`
})

const fullUrl = computed(() => `${window.location.origin}${requestUrl.value}`)

async function send() {
  isLoading.value = true
  response.value = null
  try {
    const result = await fetch(requestUrl.value)
    const body = await result.json()
    response.value = { status: result.status, body: JSON.stringify(body, null, 2) }
  } catch {
    response.value = { status: 0, body: 'The request could not be sent. Check your connection.' }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Open data</p>
      <h1>Use our data<br />on your own site.</h1>
      <p class="page-intro__lede">
        Councils, libraries and partner organisations are welcome to publish our event listings and
        drop-off points. This API serves the same catalogue the site uses, so what you show is never
        a copy that quietly goes out of date. No account, no key, free to republish with attribution.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <h2 class="api-heading">Endpoints</h2>

      <div v-for="endpoint in endpoints" :key="endpoint.path" class="crate-card api-card">
        <span class="crate-card__tag">GET</span>
        <h3 class="api-card__path">{{ endpoint.path }}</h3>
        <p class="api-card__summary">{{ endpoint.summary }}</p>
        <table class="api-params">
          <caption class="api-params__caption">
            Query parameters for {{ endpoint.path }}
          </caption>
          <thead>
            <tr>
              <th scope="col">Parameter</th>
              <th scope="col">What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="parameter in endpoint.parameters" :key="parameter.name">
              <th scope="row"><code>{{ parameter.name }}</code></th>
              <td>{{ parameter.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="api-heading">Try it</h2>
      <div class="crate-card api-console">
        <span class="crate-card__tag">CONSOLE</span>
        <p class="api-console__intro">
          This sends a real request to the API and shows exactly what comes back.
        </p>

        <div class="api-console__fields">
          <div class="field">
            <label for="api-resource">Endpoint</label>
            <select id="api-resource" v-model="resource">
              <option value="events">/api/events</option>
              <option value="locations">/api/locations</option>
            </select>
          </div>
          <div class="field">
            <label for="api-suburb">Suburb (optional)</label>
            <input id="api-suburb" v-model="suburb" type="text" placeholder="Preston" />
          </div>
          <div class="field">
            <label for="api-limit">Limit</label>
            <input id="api-limit" v-model="limit" type="number" min="1" max="100" />
          </div>
        </div>

        <p class="api-console__url">
          <span class="api-console__method">GET</span>
          <code>{{ fullUrl }}</code>
        </p>

        <button
          type="button"
          class="btn-reloop btn-reloop--primary"
          :disabled="isLoading"
          @click="send"
        >
          {{ isLoading ? 'Sending…' : 'Send request' }}
        </button>

        <div v-if="response" class="api-console__response">
          <p class="api-console__status" role="status">
            Responded with HTTP {{ response.status }}.
          </p>
          <!-- tabindex makes the scrolling panel reachable by keyboard; without
               it the response can be seen but not scrolled without a mouse. -->
          <pre tabindex="0" aria-label="API response body"><code>{{ response.body }}</code></pre>
        </div>
      </div>

      <h2 class="api-heading">Notes</h2>
      <ul class="api-notes">
        <li>Read-only. Any method other than GET returns 405.</li>
        <li>
          Open to any origin, so you can call it straight from a browser without a proxy.
        </li>
        <li>
          Responses are cached for five minutes, so heavy use costs us nothing and stays fast for
          you.
        </li>
        <li>
          Please credit ReLoop Melbourne and link back, so people can check event details before
          they travel.
        </li>
      </ul>
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

.api-heading {
  font-size: 1.25rem;
  margin: 2rem 0 1rem;
}

.api-heading:first-child {
  margin-top: 0;
}

.api-card,
.api-console {
  padding-top: 2rem;
  margin-bottom: 1.25rem;
  height: auto;
}

.api-card__path {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}

.api-card__summary {
  margin-bottom: 1rem;
  color: var(--ink-soft);
}

.api-params {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.api-params__caption {
  text-align: left;
  padding-bottom: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.api-params th,
.api-params td {
  padding: 0.5rem 0.75rem 0.5rem 0;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--kraft-dark);
}

.api-params tbody th {
  font-weight: 400;
  white-space: nowrap;
}

.api-console__intro {
  margin-bottom: 1.25rem;
  color: var(--ink-soft);
}

.api-console__fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 1rem;
}

.api-console__url {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  margin-bottom: 1rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  word-break: break-all;
  background-color: var(--paper-dim);
  border-radius: var(--radius);
}

.api-console__method {
  padding: 0.1em 0.45em;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--paper);
  background-color: var(--loop);
  border-radius: 3px;
}

.api-console__response {
  margin-top: 1.25rem;
}

.api-console__status {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.api-console__response pre {
  max-height: 22rem;
  overflow: auto;
  padding: 0.9rem;
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--paper);
  background-color: var(--ink);
  border-radius: var(--radius);
}

.api-notes {
  max-width: 62ch;
  padding-left: 1.1rem;
  color: var(--ink-soft);
}

.api-notes li {
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .api-console__fields {
    grid-template-columns: 1fr 1fr 6rem;
  }
}
</style>
