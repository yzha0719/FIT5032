// Reusable field validators shared across every form in the app.
// Each validator takes a value and returns either `null` (valid) or a
// short user-facing error string.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function required(label) {
  return (value) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return `${label} is required.`
    }
    return null
  }
}

export function minLength(label, min) {
  return (value) => {
    if (value && String(value).trim().length < min) {
      return `${label} must be at least ${min} characters.`
    }
    return null
  }
}

export function email(label = 'Email') {
  return (value) => {
    if (value && !EMAIL_RE.test(value)) {
      return `${label} must be a valid email address (e.g. name@example.com).`
    }
    return null
  }
}

export function numberRange(label, min, max) {
  return (value) => {
    if (value === null || value === undefined || value === '') return null
    const numeric = Number(value)
    if (Number.isNaN(numeric)) {
      return `${label} must be a number.`
    }
    if (numeric < min || numeric > max) {
      return `${label} must be between ${min} and ${max}.`
    }
    return null
  }
}

/**
 * Runs an array of validator functions against a value and returns the
 * first error message found, or null if all pass.
 */
export function runValidators(value, validators) {
  for (const validate of validators) {
    const result = validate(value)
    if (result) return result
  }
  return null
}
