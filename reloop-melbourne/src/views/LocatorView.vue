<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_TOKEN, MELBOURNE_CENTRE, distanceKm, useGeo } from '../composables/useGeo'
import { locations, locationTypes } from '../data/locations'

// Recycling & repair locator (BR E.2). Two non-trivial map features:
//   1. find what's closest to where you actually are, and
//   2. draw real travel directions from there to the place you pick.
const { position, geoError, isLocating, locate, clearPosition, fetchRoute } = useGeo()

const mapContainer = ref(null)
// shallowRef: the map instance is a big external object, and making it deeply
// reactive would be wasteful and can break the library.
const map = shallowRef(null)
const markers = new Map()

const searchTerm = ref('')
const selectedType = ref('All')
const selectedId = ref(null)
const travelMode = ref('driving')
const route = ref(null)
const routeError = ref(null)
const isRouting = ref(false)
const status = ref('')

const typeOptions = ['All', ...locationTypes]

const filteredLocations = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const withDistance = locations.map((place) => ({
    ...place,
    km: position.value ? distanceKm(position.value, place) : null,
  }))

  const matching = withDistance.filter((place) => {
    const matchesType = selectedType.value === 'All' || place.type === selectedType.value
    const haystack = `${place.name} ${place.suburb} ${place.accepts.join(' ')}`.toLowerCase()
    return matchesType && (term === '' || haystack.includes(term))
  })

  // Closest first once we know where the user is, otherwise alphabetical.
  return position.value
    ? matching.sort((a, b) => a.km - b.km)
    : matching.sort((a, b) => a.name.localeCompare(b.name))
})

const selectedPlace = computed(
  () => filteredLocations.value.find((place) => place.id === selectedId.value) ?? null,
)

function formatKm(km) {
  if (km === null || km === undefined) return ''
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`
}

/* Map set-up */

const markerColours = {
  'Recycling point': '#1f6f63',
  'Repair café': '#f2542d',
  'Swap & op shop': '#7c8577',
  'E-waste drop-off': '#16241c',
}

function drawMarkers() {
  const wanted = new Set(filteredLocations.value.map((place) => place.id))

  for (const [id, marker] of markers) {
    if (!wanted.has(id)) {
      marker.remove()
      markers.delete(id)
    }
  }

  for (const place of filteredLocations.value) {
    if (markers.has(place.id)) continue
    const marker = new mapboxgl.Marker({ color: markerColours[place.type] ?? '#16241c' })
      .setLngLat([place.lng, place.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 24 }).setHTML(
          // Text nodes only: no user input reaches this, and nothing is interpolated raw.
          `<strong>${place.name}</strong><br>${place.type}<br>${place.hours}`,
        ),
      )
      .addTo(map.value)

    marker.getElement().addEventListener('click', () => selectPlace(place.id))
    markers.set(place.id, marker)
  }
}

let userMarker = null

function showUserMarker() {
  if (!map.value || !position.value) return
  const lngLat = [position.value.lng, position.value.lat]
  if (userMarker) {
    userMarker.setLngLat(lngLat)
  } else {
    userMarker = new mapboxgl.Marker({ color: '#c73f1c', scale: 0.8 })
      .setLngLat(lngLat)
      .setPopup(new mapboxgl.Popup({ offset: 20 }).setText('You are here'))
      .addTo(map.value)
  }
}

function drawRoute(geometry) {
  if (!map.value) return
  const data = { type: 'Feature', properties: {}, geometry }

  // A line is part of the map style, so unlike markers it can only be added
  // once the style itself has finished loading.
  const addLine = () => {
    if (map.value.getSource('route')) {
      map.value.getSource('route').setData(data)
    } else {
      map.value.addSource('route', { type: 'geojson', data })
      map.value.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#f2542d', 'line-width': 5, 'line-opacity': 0.85 },
      })
    }

    // Zoom out far enough to show the whole trip.
    const coordinates = geometry.coordinates
    const bounds = coordinates.reduce(
      (box, point) => box.extend(point),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
    )
    map.value.fitBounds(bounds, { padding: 60, maxZoom: 14 })
  }

  if (map.value.isStyleLoaded()) {
    addLine()
  } else {
    map.value.once('load', addLine)
  }
}

function clearRoute() {
  route.value = null
  routeError.value = null
  if (map.value?.getLayer('route')) {
    map.value.removeLayer('route')
    map.value.removeSource('route')
  }
}

// Without a token the map can't load, but the list below is a complete
// alternative, so the page degrades instead of breaking.
const mapError = ref(null)

onMounted(() => {
  if (!MAPBOX_TOKEN) {
    mapError.value =
      'The map needs a Mapbox token. Copy .env.example to .env and add one — the list of places below still works.'
    return
  }

  mapboxgl.accessToken = MAPBOX_TOKEN
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [MELBOURNE_CENTRE.lng, MELBOURNE_CENTRE.lat],
    zoom: 9.5,
  })
  map.value.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
  // Markers are DOM overlays, so they don't have to wait for the style to load.
  drawMarkers()
})

onBeforeUnmount(() => {
  map.value?.remove()
  markers.clear()
})

watch(filteredLocations, () => {
  if (map.value) drawMarkers()
})

/* Actions */

function selectPlace(id) {
  selectedId.value = id
  clearRoute()
  const place = locations.find((entry) => entry.id === id)
  if (place && map.value) {
    map.value.flyTo({ center: [place.lng, place.lat], zoom: 13, speed: 1.2 })
    status.value = `${place.name} selected. ${place.address}.`
  }
}

// Map feature 1: find what is closest to the person using the page.
async function handleLocate() {
  status.value = 'Finding your location…'
  const found = await locate()
  if (!found) {
    status.value = geoError.value ?? 'Could not get your location.'
    return
  }
  showUserMarker()
  map.value?.flyTo({ center: [found.lng, found.lat], zoom: 11.5 })
  const nearest = filteredLocations.value[0]
  status.value = nearest
    ? `Found you. Closest is ${nearest.name}, about ${formatKm(nearest.km)} away.`
    : 'Found you, but nothing matches your filters.'
}

function handleClearLocation() {
  clearPosition()
  clearRoute()
  userMarker?.remove()
  userMarker = null
  status.value = 'Location cleared. The list is back in alphabetical order.'
}

// Map feature 2: real directions from the user to the selected place.
async function handleDirections() {
  if (!position.value || !selectedPlace.value) return

  isRouting.value = true
  routeError.value = null
  status.value = 'Working out directions…'

  const result = await fetchRoute(position.value, selectedPlace.value, travelMode.value)
  isRouting.value = false

  if (!result.ok) {
    routeError.value = result.error
    status.value = result.error
    return
  }

  route.value = { km: result.km, minutes: result.minutes }
  drawRoute(result.geometry)
  status.value = `${formatKm(result.km)} and about ${result.minutes} minutes by ${travelMode.value} to ${selectedPlace.value.name}.`
}

watch(travelMode, () => {
  if (route.value) handleDirections()
})
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Recycling &amp; waste hub</p>
      <h1>Find a drop-off<br />or repair point.</h1>
      <p class="page-intro__lede">
        Twelve places around Melbourne that take hard-to-recycle items, fix things or pass them on.
        Share your location to see what's closest, then get directions.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <div class="locator-controls">
        <div class="field">
          <label for="locator-search">Search</label>
          <input
            id="locator-search"
            v-model="searchTerm"
            type="search"
            placeholder="e.g. batteries, Preston, bikes"
          />
        </div>

        <div class="field">
          <label for="locator-type">Type</label>
          <select id="locator-type" v-model="selectedType">
            <option v-for="type in typeOptions" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <div class="locator-controls__actions">
          <button
            type="button"
            class="btn-reloop btn-reloop--primary btn-reloop--sm"
            :disabled="isLocating"
            @click="handleLocate"
          >
            {{ isLocating ? 'Locating…' : 'Use my location' }}
          </button>
          <button
            v-if="position"
            type="button"
            class="btn-reloop btn-reloop--outline btn-reloop--sm"
            @click="handleClearLocation"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- One live region announces every map change for screen reader users -->
      <p class="locator-status" role="status">{{ status }}</p>
      <p v-if="geoError" class="locator-error" role="alert">{{ geoError }}</p>

      <div class="locator-layout">
        <!-- The list is the accessible equivalent of the map, not an extra -->
        <div class="locator-list">
          <p class="locator-list__count">
            {{ filteredLocations.length }} of {{ locations.length }} places
            <span v-if="position"> &middot; closest first</span>
          </p>

          <ul>
            <li v-for="place in filteredLocations" :key="place.id">
              <button
                type="button"
                class="place"
                :class="{ 'is-selected': place.id === selectedId }"
                :aria-pressed="place.id === selectedId"
                @click="selectPlace(place.id)"
              >
                <span class="place__head">
                  <span class="place__name">{{ place.name }}</span>
                  <span v-if="place.km !== null" class="place__distance">{{
                    formatKm(place.km)
                  }}</span>
                </span>
                <span class="place__type">{{ place.type }} &middot; {{ place.suburb }}</span>
                <span class="place__hours">{{ place.hours }}</span>
                <span class="place__accepts">Takes: {{ place.accepts.join(', ') }}</span>
              </button>
            </li>
          </ul>

          <p v-if="!filteredLocations.length" class="locator-empty">
            Nothing matches that search. Try a different item or suburb.
          </p>
        </div>

        <div class="locator-map">
          <p v-if="mapError" class="locator-error" role="alert">{{ mapError }}</p>
          <!-- v-show, not v-if: the ref has to stay attached for Mapbox -->
          <div
            v-show="!mapError"
            ref="mapContainer"
            class="locator-map__canvas"
            aria-hidden="true"
          ></div>

          <div v-if="selectedPlace" class="locator-details crate-card">
            <span class="crate-card__tag">SELECTED</span>
            <h2 class="locator-details__name">{{ selectedPlace.name }}</h2>
            <p class="locator-details__meta">{{ selectedPlace.address }}</p>
            <p class="locator-details__meta">{{ selectedPlace.hours }}</p>

            <div class="locator-details__directions">
              <div class="field">
                <label for="travel-mode">Travel mode</label>
                <select id="travel-mode" v-model="travelMode">
                  <option value="driving">Driving</option>
                  <option value="cycling">Cycling</option>
                  <option value="walking">Walking</option>
                </select>
              </div>

              <button
                type="button"
                class="btn-reloop btn-reloop--primary btn-reloop--sm"
                :disabled="!position || isRouting"
                @click="handleDirections"
              >
                {{ isRouting ? 'Working it out…' : 'Get directions' }}
              </button>
            </div>

            <p v-if="!position" class="locator-details__hint">
              Share your location first to get directions from where you are.
            </p>
            <p v-if="route" class="locator-details__route">
              <strong>{{ formatKm(route.km) }}</strong> · about
              <strong>{{ route.minutes }} min</strong> by {{ travelMode }}
            </p>
            <p v-if="routeError" class="locator-details__error" role="alert">{{ routeError }}</p>
          </div>
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

.locator-controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
}

.locator-controls__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.locator-status {
  min-height: 1.4em;
  margin: 0 0 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--loop);
}

.locator-error {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--reclaim-dark);
  background-color: var(--paper);
  border: 2px solid var(--reclaim-dark);
  border-radius: var(--radius);
}

.locator-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.locator-list__count {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.locator-list ul {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.place {
  display: grid;
  gap: 0.15rem;
  width: 100%;
  padding: 0.8rem 0.9rem;
  font-family: var(--font-body);
  text-align: left;
  /* A button doesn't inherit the page's text colour: without this it falls back
     to the browser's own button text, which is white under a dark system theme
     and unreadable on paper (WCAG 2.1 AA, BR E.3). */
  color: var(--ink);
  background-color: var(--paper);
  border: 2px solid var(--kraft-dark);
  border-radius: var(--radius);
  cursor: pointer;
}

.place:hover {
  border-color: var(--ink);
}

.place.is-selected {
  border-color: var(--loop);
  box-shadow: inset 4px 0 0 var(--loop);
}

.place__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
}

.place__name {
  font-weight: 700;
}

.place__distance {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--reclaim-dark);
}

.place__type,
.place__hours,
.place__accepts {
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.locator-empty {
  color: var(--ink-soft);
}

.locator-map__canvas {
  height: 420px;
  border: 1px solid var(--kraft-dark);
  border-radius: var(--radius);
  overflow: hidden;
}

.locator-details {
  height: auto;
  margin-top: 1.5rem;
  padding-top: 1.75rem;
}

.locator-details__name {
  font-size: 1.3rem;
  margin: 0.25rem 0 0.5rem;
}

.locator-details__meta {
  margin: 0 0 0.3rem;
  font-size: 0.9rem;
  color: var(--ink-soft);
}

.locator-details__directions {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.locator-details__directions .field {
  margin-bottom: 0;
  min-width: 10rem;
}

.locator-details__hint {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.locator-details__route {
  margin: 0.75rem 0 0;
  font-size: 1rem;
}

.locator-details__error {
  margin: 0.75rem 0 0;
  font-weight: 600;
  color: var(--reclaim-dark);
}

@media (min-width: 768px) {
  .locator-controls {
    grid-template-columns: 2fr 1fr auto;
  }
}

@media (min-width: 992px) {
  .locator-layout {
    grid-template-columns: 2fr 3fr;
    align-items: start;
  }

  .locator-map__canvas {
    height: 560px;
  }
}
</style>
