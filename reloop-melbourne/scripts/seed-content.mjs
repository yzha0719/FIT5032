// Publishes the event and location catalogue into Firestore, where the public
// API (BR F.1) reads it from.
//
//   node scripts/seed-content.mjs
//
// src/data/events.js and src/data/locations.js stay the source of truth: the
// site imports them directly at build time, and this script copies them into
// the database so the API can serve the same catalogue to other organisations.
// Re-run it whenever either file changes.
//
// Like seed-users.mjs this uses the normal client SDK, so it can only do what
// the rules allow — and firestore.rules only lets an admin write these
// collections, which is why it signs in first.
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, writeBatch } from 'firebase/firestore'
import { auth, db } from '../src/firebase.js'
import { events } from '../src/data/events.js'
import { locations } from '../src/data/locations.js'

const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = 'Passw0rd!'

// Only the fields the API is allowed to hand out. Anything added to the data
// files later has to be listed here before it can leave the building.
function publicEvent(event) {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    suburb: event.suburb,
    date: event.date,
    spotsLeft: event.spotsLeft,
  }
}

function publicLocation(place) {
  return {
    id: place.id,
    name: place.name,
    type: place.type,
    address: place.address,
    suburb: place.suburb,
    hours: place.hours,
    accepts: place.accepts,
    lng: place.lng,
    lat: place.lat,
  }
}

try {
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
  console.log(`signed in as ${ADMIN_EMAIL}`)

  const batch = writeBatch(db)
  for (const event of events) {
    batch.set(doc(db, 'events', event.id), publicEvent(event))
  }
  for (const place of locations) {
    batch.set(doc(db, 'locations', place.id), publicLocation(place))
  }
  await batch.commit()

  console.log(`published ${events.length} events and ${locations.length} locations`)
  console.log('\nTry it:')
  console.log('  https://reloop-melbourne-78b45.web.app/api/events?when=upcoming&limit=3')
  await signOut(auth)
  process.exit(0)
} catch (error) {
  console.error('FAILED:', error.code ?? error.message)
  console.error('\nIf this is a permission error, check that admin@example.com still has')
  console.error('role: "admin" in Firestore, and that the rules are deployed.')
  process.exit(1)
}
