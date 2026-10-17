import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'
import { stripStatusCode } from './useAuth'

// Calls the Cloud Functions that send email (BR D.2, E.1). The functions do the
// real work — the SendGrid key lives there, not in this bundle.

const callEmailMyShifts = httpsCallable(functions, 'emailMyShifts')
const callEmailMembers = httpsCallable(functions, 'emailMembers')

// Callable functions reject with a code like 'functions/permission-denied'.
// Messages we wrote ourselves are safe to show; anything else gets a generic one.
function readableError(error) {
  const expected = [
    'functions/unauthenticated',
    'functions/permission-denied',
    'functions/invalid-argument',
    'functions/failed-precondition',
  ]
  if (expected.includes(error.code)) return stripStatusCode(error.message)
  return 'Could not send the email right now. Please try again in a moment.'
}

async function emailMyShifts(shifts) {
  try {
    const result = await callEmailMyShifts({ shifts })
    return { ok: true, ...result.data }
  } catch (error) {
    return { ok: false, error: readableError(error) }
  }
}

async function emailMembers({ subject, message, audience }) {
  try {
    const result = await callEmailMembers({ subject, message, audience })
    return { ok: true, ...result.data }
  } catch (error) {
    return { ok: false, error: readableError(error) }
  }
}

export function useEmail() {
  return { emailMyShifts, emailMembers }
}
