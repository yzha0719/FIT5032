// Cloud Functions for ReLoop Melbourne (BR E.1), used to send email (BR D.2).
//
// Everything here runs on the server for one reason: the SendGrid API key must
// never reach the browser. The key is stored in Secret Manager and injected at
// run time, so it is not in the code, not in git, and not in the bundle.
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { setGlobalOptions } from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = defineSecret('SENDGRID_API_KEY')

// The address verified in SendGrid as a Single Sender.
// Visitors may only pick 'member' or 'volunteer' when they register, so 'admin'
// can be granted here and nowhere else in the app.
const ASSIGNABLE_ROLES = ['member', 'volunteer', 'admin']

const FROM_EMAIL = 'yimingzhangcn@gmail.com'
const FROM_NAME = 'ReLoop Melbourne'

// Same region as Firestore, so a function reading the database doesn't cross
// regions on every call.
setGlobalOptions({ region: 'australia-southeast1', maxInstances: 5 })

initializeApp()
const db = getFirestore()

/* Helpers */

function requireSignedIn(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please log in first.')
  }
  return request.auth
}

// The caller's role comes from Firestore, never from the request, so a user
// can't claim to be an admin by editing what the browser sends.
async function roleOf(uid) {
  const snapshot = await db.collection('users').doc(uid).get()
  return snapshot.exists ? snapshot.data().role : null
}

function cleanText(value, { max, label }) {
  const text = String(value ?? '').trim()
  if (!text) throw new HttpsError('invalid-argument', `${label} is required.`)
  if (text.length > max) {
    throw new HttpsError('invalid-argument', `${label} must be ${max} characters or fewer.`)
  }
  return text
}

// Quotes a CSV field so commas, quotes and line breaks can't break the file
// or inject a formula into a spreadsheet.
function csvCell(value) {
  const text = String(value ?? '')
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${guarded.replace(/"/g, '""')}"`
}

function toCsv(headers, rows) {
  const lines = [headers.map(csvCell).join(',')]
  for (const row of rows) {
    lines.push(row.map(csvCell).join(','))
  }
  return lines.join('\r\n')
}

function asAttachment(filename, text) {
  return {
    filename,
    type: 'text/csv',
    disposition: 'attachment',
    content: Buffer.from(text, 'utf8').toString('base64'),
  }
}

// Plain text keeps the HTML escaping problem out of the email entirely.
function textToHtml(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

/* BR D.2: a volunteer emails themselves a copy of their shifts, as a CSV */

export const emailMyShifts = onCall({ secrets: [SENDGRID_API_KEY] }, async (request) => {
  const auth = requireSignedIn(request)
  const role = await roleOf(auth.uid)
  if (role !== 'volunteer' && role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only volunteers can email a shift summary.')
  }

  const shifts = Array.isArray(request.data?.shifts) ? request.data.shifts : []
  if (!shifts.length) {
    throw new HttpsError('invalid-argument', 'There are no shifts to send.')
  }
  if (shifts.length > 50) {
    throw new HttpsError('invalid-argument', 'Too many shifts in one email.')
  }

  const rows = shifts.slice(0, 50).map((shift) => [
    String(shift?.date ?? '').slice(0, 40),
    String(shift?.event ?? '').slice(0, 120),
    String(shift?.task ?? '').slice(0, 120),
    String(shift?.start ?? '').slice(0, 10),
    String(shift?.end ?? '').slice(0, 10),
  ])
  const csv = toCsv(['Date', 'Event', 'Task', 'Start', 'End'], rows)

  const lines = rows.map((row) => `• ${row[0]}, ${row[3]}–${row[4]} — ${row[2]} (${row[1]})`)
  const body = [
    `Hi ${request.auth.token.name || 'there'},`,
    `Here are the ${rows.length} volunteer shift${rows.length === 1 ? '' : 's'} you're booked for.`,
    lines.join('\n'),
    'The attached CSV opens in Excel or Google Sheets, and you can import it into a calendar app.',
    'Thanks for helping out,\nReLoop Melbourne',
  ].join('\n\n')

  sgMail.setApiKey(SENDGRID_API_KEY.value())
  // The address comes from the verified auth token, so nobody can use this to
  // send mail to someone else.
  await sgMail.send({
    to: auth.token.email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Your ReLoop volunteer shifts (${rows.length})`,
    text: body,
    html: textToHtml(body),
    attachments: [asAttachment('my-volunteer-shifts.csv', csv)],
  })

  logger.info('shift summary sent', { uid: auth.uid, shifts: rows.length })
  return { ok: true, sentTo: auth.token.email, shifts: rows.length }
})

/* BR D.2 + F.1: an admin emails every member or volunteer at once */

export const emailMembers = onCall({ secrets: [SENDGRID_API_KEY] }, async (request) => {
  const auth = requireSignedIn(request)
  if ((await roleOf(auth.uid)) !== 'admin') {
    throw new HttpsError('permission-denied', 'Only administrators can send bulk email.')
  }

  const subject = cleanText(request.data?.subject, { max: 120, label: 'Subject' })
  const message = cleanText(request.data?.message, { max: 4000, label: 'Message' })
  const audience = request.data?.audience ?? 'all'
  if (!['all', 'member', 'volunteer'].includes(audience)) {
    throw new HttpsError('invalid-argument', 'Please choose a valid audience.')
  }

  // Recipients come from Firestore, not from the browser.
  const query = audience === 'all' ? db.collection('users') : db.collection('users').where('role', '==', audience)
  const snapshot = await query.get()
  const recipients = snapshot.docs
    .map((entry) => entry.data())
    .filter((user) => typeof user.email === 'string' && user.email.includes('@'))

  if (!recipients.length) {
    throw new HttpsError('failed-precondition', 'No one matches that audience yet.')
  }

  const csv = toCsv(
    ['Name', 'Email', 'Role'],
    recipients.map((user) => [user.name, user.email, user.role]),
  )
  const body = `${message}\n\n—\nReLoop Melbourne\nYou are receiving this because you have a ReLoop Melbourne account.`

  sgMail.setApiKey(SENDGRID_API_KEY.value())
  // One personalization per recipient: everyone gets their own copy and nobody
  // sees anyone else's address.
  await sgMail.send({
    personalizations: recipients.map((user) => ({ to: [{ email: user.email, name: user.name }] })),
    from: { email: FROM_EMAIL, name: FROM_NAME },
    replyTo: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    text: body,
    html: textToHtml(body),
    attachments: [asAttachment('reloop-recipients.csv', csv)],
  })

  logger.info('bulk email sent', { uid: auth.uid, audience, recipients: recipients.length })
  return { ok: true, recipients: recipients.length, audience }
})


/* BR E.1 + C.2: an admin changes someone else's role.

   This is the one job in the project that cannot be done from the browser.
   The rules in firestore.rules refuse every client-side write to a role field,
   because the browser is exactly what we don't trust: a check that asks the
   caller whether the caller is an admin proves nothing. Here the caller's own
   role is read from Firestore with the Admin SDK, which bypasses the rules,
   and the custom claim below can only be signed by a trusted server. */

export const setUserRole = onCall(async (request) => {
  const auth = requireSignedIn(request)
  if ((await roleOf(auth.uid)) !== 'admin') {
    throw new HttpsError('permission-denied', 'Only administrators can change a role.')
  }

  const uid = cleanText(request.data?.uid, { max: 128, label: 'Account' })
  const role = String(request.data?.role ?? '')
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new HttpsError('invalid-argument', 'Please choose a valid role.')
  }
  // Demoting yourself could leave the site with no administrator at all.
  if (uid === auth.uid) {
    throw new HttpsError('failed-precondition', 'You cannot change your own role.')
  }

  const profile = db.collection('users').doc(uid)
  const snapshot = await profile.get()
  if (!snapshot.exists) {
    throw new HttpsError('not-found', 'That account no longer exists.')
  }

  const previous = snapshot.data().role
  if (previous === role) {
    return { ok: true, uid, role, previous, changed: false }
  }

  await profile.update({
    role,
    roleUpdatedAt: new Date().toISOString(),
    roleUpdatedBy: auth.uid,
  })

  // The claim rides along inside the user's ID token, so security rules and
  // other functions can read a role without a database lookup. It reaches that
  // user's browser when their token next refreshes, so the Firestore document
  // above stays the one source of truth the app reads today.
  await getAuth().setCustomUserClaims(uid, { role })

  logger.info('role changed', { by: auth.uid, uid, from: previous, to: role })
  return { ok: true, uid, role, previous, changed: true }
})


/* BR E.1: keep a count of accounts per role, rebuilt whenever one changes.

   Nothing calls this function. Firestore itself wakes it up when a document
   under users/ is written, which is the part a callable function can't show:
   the work happens because the data moved, not because a browser asked.

   Counting the collection from scratch is slower than adding one and
   subtracting one, but it cannot drift. A missed or retried event leaves the
   same answer behind, which matters more than the handful of reads it costs
   at this size. It writes to stats/, never to users/, so it can't retrigger
   itself. */

export const countAccountsByRole = onDocumentWritten('users/{uid}', async (event) => {
  const before = event.data?.before?.data()?.role ?? null
  const after = event.data?.after?.data()?.role ?? null
  // Someone correcting their name doesn't change any count.
  if (before === after) return

  const snapshot = await db.collection('users').get()
  const byRole = { member: 0, volunteer: 0, admin: 0 }
  for (const profile of snapshot.docs) {
    const role = profile.data().role
    if (role in byRole) byRole[role] += 1
  }

  await db.collection('stats').doc('overview').set({
    byRole,
    total: snapshot.size,
    updatedAt: new Date().toISOString(),
  })

  logger.info('account counts rebuilt', { ...byRole, total: snapshot.size, from: before, to: after })
})
