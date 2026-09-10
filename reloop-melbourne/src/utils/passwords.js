// Password hashing for the client-side login (BR C.4).
//
// Uses PBKDF2 from the browser's built-in Web Crypto API. The password is
// combined with a random salt for each user and hashed many thousands of
// times, so a copied user list doesn't give away passwords, two people with
// the same password get different hashes, and every guess is slow to check.
//
// Web Crypto only works on https:// or localhost.

// OWASP suggests 600,000 iterations for PBKDF2-SHA256. 100,000 keeps login
// quick on older phones for this demo; raise it for a real deployment.
const ITERATIONS = 100_000

const encoder = new TextEncoder()

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

// 16 random bytes from the browser's secure random number generator.
export function createSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)))
}

export async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: ITERATIONS },
    key,
    256,
  )
  return toHex(bits)
}

// Checks every character even after finding a difference, so the time taken
// doesn't hint at how much of the hash matched.
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return difference === 0
}

export async function verifyPassword(password, salt, expectedHash) {
  const actualHash = await hashPassword(password, salt)
  return constantTimeEqual(actualHash, expectedHash)
}
