import { computed } from 'vue'
import { events, isPastEvent } from '../data/events'
import { seedRatings } from '../data/ratings'
import { useAuth } from './useAuth'
import { useLocalStorageState } from './useLocalStorageState'

// Members and volunteers can rate. Admins are left out so staff can't move the
// community scores that new visitors and funders rely on.
export const RATER_ROLES = ['member', 'volunteer']

const { currentUser, hasRole } = useAuth()

// Ratings left on this site. Module-level, like useAuth, so every event card
// shares the same data.
const userRatings = useLocalStorageState('reloop:ratings', [])

// localStorage can be edited by hand, so anything that isn't a whole number
// from 1 to 5 is ignored instead of breaking the averages.
function isValidRating(rating) {
  return (
    typeof rating?.eventId === 'string' &&
    rating.userId != null &&
    Number.isInteger(rating.stars) &&
    rating.stars >= 1 &&
    rating.stars <= 5
  )
}

// Seed ratings plus ratings from this site, keeping only the latest rating for
// each person and event. That holds the "one rating per person" rule even if
// the stored data has duplicates.
const allRatings = computed(() => {
  const latest = new Map()
  for (const rating of [...seedRatings, ...userRatings.value]) {
    if (isValidRating(rating)) {
      latest.set(`${rating.eventId}:${rating.userId}`, rating)
    }
  }
  return [...latest.values()]
})

// Sum and count per event, recalculated whenever any rating changes.
const totalsByEvent = computed(() => {
  const totals = {}
  for (const { eventId, stars } of allRatings.value) {
    totals[eventId] ??= { sum: 0, count: 0 }
    totals[eventId].sum += stars
    totals[eventId].count += 1
  }
  return totals
})

function getSummary(eventId) {
  const totals = totalsByEvent.value[eventId]
  if (!totals) return { average: 0, count: 0 }
  // Rounded to one decimal place, e.g. 4.6
  const average = Math.round((totals.sum / totals.count) * 10) / 10
  return { average, count: totals.count }
}

function getUserRating(eventId) {
  if (!currentUser.value) return null
  const own = allRatings.value.find(
    (rating) => rating.eventId === eventId && rating.userId === currentUser.value.id,
  )
  return own ? own.stars : null
}

function canRate(event) {
  return hasRole(...RATER_ROLES) && isPastEvent(event)
}

function rate(eventId, stars) {
  const event = events.find((e) => e.id === eventId)
  if (!event || !isPastEvent(event)) {
    return { ok: false, error: "This event hasn't happened yet, so it can't be rated." }
  }
  if (!hasRole(...RATER_ROLES)) {
    return { ok: false, error: 'Log in as a member or volunteer to rate events.' }
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, error: 'Please choose between 1 and 5 stars.' }
  }

  // The user id comes from the session, never from the page, so nobody can
  // rate on someone else's behalf. Rating again replaces the old rating.
  const userId = currentUser.value.id
  const others = userRatings.value.filter(
    (rating) => !(rating.eventId === eventId && rating.userId === userId),
  )
  userRatings.value = [...others, { eventId, userId, stars, ratedAt: new Date().toISOString() }]
  return { ok: true }
}

export function useRatings() {
  return { getSummary, getUserRating, canRate, rate }
}
