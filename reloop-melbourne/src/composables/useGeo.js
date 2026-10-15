import { ref } from 'vue'

// Location helpers for the recycling locator (BR E.2).
//
// The Mapbox token comes from .env (see .env.example), which is git-ignored.
// It is a *public* token (pk. prefix) that Mapbox issues for browser use and
// Vite inlines it into the bundle at build time, so it is not a secret in the
// way the SendGrid key is — that one never leaves Cloud Functions. Keeping it
// out of the repository still avoids committing account credentials.
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

export const MELBOURNE_CENTRE = { lng: 144.9631, lat: -37.8136 }

// Straight-line distance in kilometres (haversine). Good enough for sorting a
// list by "closest first"; the real road distance comes from the Directions API.
export function distanceKm(from, to) {
  const earthRadius = 6371
  const toRadians = (degrees) => (degrees * Math.PI) / 180

  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2
  return earthRadius * 2 * Math.asin(Math.sqrt(a))
}

function geolocationMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied. You can still browse the list below.'
    case error.POSITION_UNAVAILABLE:
      return 'Your location is not available right now. Try again, or browse the list below.'
    case error.TIMEOUT:
      return 'Finding your location took too long. Try again, or browse the list below.'
    default:
      return 'Could not get your location. You can still browse the list below.'
  }
}

export function useGeo() {
  const position = ref(null)
  const geoError = ref(null)
  const isLocating = ref(false)

  // Asks the browser for the user's position. Nothing happens without the
  // permission prompt, and the answer never leaves the page.
  function locate() {
    geoError.value = null

    if (!('geolocation' in navigator)) {
      geoError.value = 'This browser does not support location sharing.'
      return Promise.resolve(null)
    }

    isLocating.value = true
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (result) => {
          position.value = { lng: result.coords.longitude, lat: result.coords.latitude }
          isLocating.value = false
          resolve(position.value)
        },
        (error) => {
          geoError.value = geolocationMessage(error)
          isLocating.value = false
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      )
    })
  }

  function clearPosition() {
    position.value = null
    geoError.value = null
  }

  // Mapbox Directions API: real travel distance and time, plus the line to draw.
  async function fetchRoute(from, to, profile = 'driving') {
    const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}` +
      `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        return { ok: false, error: 'Could not work out directions right now.' }
      }
      const data = await response.json()
      const route = data.routes?.[0]
      if (!route) {
        return { ok: false, error: 'No route found between those two points.' }
      }
      return {
        ok: true,
        geometry: route.geometry,
        km: route.distance / 1000,
        minutes: Math.round(route.duration / 60),
      }
    } catch {
      return { ok: false, error: 'Could not reach the directions service. Check your connection.' }
    }
  }

  return { position, geoError, isLocating, locate, clearPosition, fetchRoute }
}
