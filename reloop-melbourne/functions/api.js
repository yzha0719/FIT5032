/* BR F.1: a public, read-only API over ReLoop Melbourne's open data.

   Councils and partner organisations keep asking for our event listings so
   they can show them on their own sites. Sending a spreadsheet by email goes
   stale the day after it is sent, so this serves the same catalogue over HTTP
   instead: no account, no key, CORS open to any origin, and cached at the edge
   so a popular caller doesn't become a cost.

   It is deliberately read-only. Nothing here writes, and the collections it
   reads are closed to browsers in firestore.rules — the only way into them is
   this function, which decides exactly which fields leave the building. */

import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

// Five minutes at the CDN. The catalogue changes a few times a week, so most
// callers never reach the function at all.
const CACHE_CONTROL = 'public, max-age=300, s-maxage=300'

function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Matches "preston" against "Preston", and ignores surrounding spaces, so a
// caller doesn't have to know our capitalisation.
function looseEquals(value, wanted) {
  return String(value ?? '').trim().toLowerCase() === String(wanted).trim().toLowerCase()
}

function readLimit(raw) {
  if (raw === undefined) return DEFAULT_LIMIT
  const limit = Number(raw)
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new ApiError(400, `limit must be a whole number between 1 and ${MAX_LIMIT}.`)
  }
  return limit
}

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function listEvents(db, query) {
  const when = query.when ?? 'all'
  if (!['all', 'upcoming', 'past'].includes(when)) {
    throw new ApiError(400, 'when must be one of: all, upcoming, past.')
  }
  const limit = readLimit(query.limit)

  // Ordering is done by Firestore; the rest is filtered here. With a catalogue
  // this size that is one cheap read, and it avoids asking every caller's
  // combination of filters to have its own composite index. A larger dataset
  // would push suburb and category into the query and index them.
  const snapshot = await db.collection('events').orderBy('date').get()
  const key = today()

  let rows = snapshot.docs.map((doc) => doc.data())
  if (query.suburb) rows = rows.filter((row) => looseEquals(row.suburb, query.suburb))
  if (query.category) rows = rows.filter((row) => looseEquals(row.category, query.category))
  if (when === 'upcoming') rows = rows.filter((row) => row.date >= key)
  if (when === 'past') rows = rows.filter((row) => row.date < key)

  return {
    total: rows.length,
    data: rows.slice(0, limit),
    filters: { suburb: query.suburb ?? null, category: query.category ?? null, when, limit },
  }
}

async function listLocations(db, query) {
  const limit = readLimit(query.limit)
  const snapshot = await db.collection('locations').orderBy('name').get()

  let rows = snapshot.docs.map((doc) => doc.data())
  if (query.suburb) rows = rows.filter((row) => looseEquals(row.suburb, query.suburb))
  if (query.type) rows = rows.filter((row) => looseEquals(row.type, query.type))
  if (query.accepts) {
    const wanted = String(query.accepts).trim().toLowerCase()
    rows = rows.filter((row) =>
      (row.accepts ?? []).some((item) => String(item).toLowerCase().includes(wanted)),
    )
  }

  return {
    total: rows.length,
    data: rows.slice(0, limit),
    filters: {
      suburb: query.suburb ?? null,
      type: query.type ?? null,
      accepts: query.accepts ?? null,
      limit,
    },
  }
}

function index() {
  return {
    name: 'ReLoop Melbourne open data API',
    version: '1.0',
    documentation: 'https://reloop-melbourne-78b45.web.app/developers',
    licence: 'Free to use and republish, with attribution to ReLoop Melbourne.',
    endpoints: [
      {
        path: '/api/events',
        description: 'Workshops, swap meets and repair sessions.',
        parameters: ['suburb', 'category', 'when (all | upcoming | past)', 'limit (1-100)'],
      },
      {
        path: '/api/locations',
        description: 'Drop-off points, repair cafés and swap shops, with coordinates.',
        parameters: ['suburb', 'type', 'accepts', 'limit (1-100)'],
      },
    ],
  }
}

/* The handler. Hosting rewrites /api/** here, so the path still carries the
   /api prefix that callers typed. */

export async function handleApiRequest(request, response) {
  response.set('Cache-Control', CACHE_CONTROL)

  if (request.method !== 'GET') {
    response.set('Allow', 'GET')
    response.status(405).json({ error: 'This API is read-only. Use GET.' })
    return
  }

  const path = request.path.replace(/^\/api/, '').replace(/\/+$/, '') || '/'
  const db = getFirestore()

  try {
    if (path === '/') {
      response.status(200).json(index())
      return
    }
    if (path === '/events') {
      response.status(200).json(await listEvents(db, request.query))
      return
    }
    if (path === '/locations') {
      response.status(200).json(await listLocations(db, request.query))
      return
    }
    response.status(404).json({
      error: `No endpoint at ${path}.`,
      endpoints: index().endpoints.map((endpoint) => endpoint.path),
    })
  } catch (error) {
    if (error instanceof ApiError) {
      response.status(error.status).json({ error: error.message })
      return
    }
    // Never hand an internal message to an anonymous caller.
    logger.error('public api failed', { path, message: error.message })
    response.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
  }
}
