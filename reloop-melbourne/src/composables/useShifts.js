import { computed } from 'vue'
import { events, isPastEvent } from '../data/events'
import { shifts } from '../data/shifts'
import { useAuth } from './useAuth'
import { useLocalStorageState } from './useLocalStorageState'

const { currentUser, hasRole } = useAuth()

const shiftsById = new Map(shifts.map((shift) => [shift.id, shift]))
const eventsById = new Map(events.map((event) => [event.id, event]))

// Sign-ups made on this site: { shiftId, userId, signedUpAt }. Module-level,
// like useAuth, so every part of the page shares the same list.
const signups = useLocalStorageState('reloop:shift-signups', [])

// localStorage can be edited by hand, so ignore sign-ups for shifts that don't
// exist and count each person only once per shift.
const validSignups = computed(() => {
  const unique = new Map()
  for (const signup of signups.value) {
    if (shiftsById.has(signup?.shiftId) && signup.userId != null) {
      unique.set(`${signup.shiftId}:${signup.userId}`, signup)
    }
  }
  return [...unique.values()]
})

function spotsLeft(shift) {
  const taken =
    shift.alreadyFilled + validSignups.value.filter((s) => s.shiftId === shift.id).length
  return Math.max(0, shift.volunteersNeeded - taken)
}

function isSignedUp(shiftId) {
  if (!currentUser.value) return false
  return validSignups.value.some((s) => s.shiftId === shiftId && s.userId === currentUser.value.id)
}

// The logged-in user's shifts, soonest first.
const myShifts = computed(() => {
  if (!currentUser.value) return []
  return validSignups.value
    .filter((s) => s.userId === currentUser.value.id)
    .map((s) => shiftsById.get(s.shiftId))
    .sort((a, b) => {
      const byDate = eventsById.get(a.eventId).date.localeCompare(eventsById.get(b.eventId).date)
      return byDate || a.start.localeCompare(b.start)
    })
})

// Two shifts clash when they are on the same day and their times overlap.
// HH:MM strings compare correctly as text, and a shift ending at 13:00 doesn't
// clash with one starting at 13:00.
function overlaps(a, b) {
  const sameDay = eventsById.get(a.eventId).date === eventsById.get(b.eventId).date
  return sameDay && a.start < b.end && b.start < a.end
}

// One of the user's own shifts that clashes with this one, if any. This is
// what stops a volunteer double-booking themselves.
function findClash(shift) {
  return myShifts.value.find((mine) => mine.id !== shift.id && overlaps(mine, shift)) ?? null
}

function signUp(shiftId) {
  const shift = shiftsById.get(shiftId)
  if (!shift) {
    return { ok: false, error: 'That shift no longer exists.' }
  }
  if (!hasRole('volunteer')) {
    return { ok: false, error: 'Only volunteer accounts can sign up for shifts.' }
  }
  if (isPastEvent(eventsById.get(shift.eventId))) {
    return { ok: false, error: 'This shift has already happened.' }
  }
  if (isSignedUp(shiftId)) {
    return { ok: false, error: "You're already signed up for this shift." }
  }
  if (spotsLeft(shift) === 0) {
    return { ok: false, error: 'Sorry, this shift is now full.' }
  }
  const clash = findClash(shift)
  if (clash) {
    return {
      ok: false,
      error: `This overlaps with your "${clash.task}" shift (${clash.start}–${clash.end}).`,
    }
  }

  // The user id comes from the session, never from the page.
  signups.value = [
    ...signups.value,
    { shiftId, userId: currentUser.value.id, signedUpAt: new Date().toISOString() },
  ]
  return { ok: true }
}

function cancel(shiftId) {
  if (!currentUser.value) {
    return { ok: false, error: 'Please log in again to change your shifts.' }
  }
  const userId = currentUser.value.id
  signups.value = signups.value.filter((s) => !(s.shiftId === shiftId && s.userId === userId))
  return { ok: true }
}

export function useShifts() {
  return { myShifts, spotsLeft, isSignedUp, findClash, signUp, cancel }
}
