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

export function maxLength(label, max) {
  return (value) => {
    if (value && String(value).length > max) {
      return `${label} must be ${max} characters or fewer.`
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

// Shared by the passwordStrength validator and the live checklist on the
// register form, so the rules only live in one place.
export const PASSWORD_RULES = [
  { text: 'at least 8 characters', test: (value) => value.length >= 8 },
  { text: 'an uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { text: 'a lowercase letter', test: (value) => /[a-z]/.test(value) },
  { text: 'a number', test: (value) => /\d/.test(value) },
]

export function passwordStrength(label = 'Password') {
  return (value) => {
    if (!value) return null
    const missing = PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.text)
    if (missing.length) {
      return `${label} needs ${missing.join(', ')}.`
    }
    return null
  }
}

// `getOtherValue` is a function so it always reads the latest value of the
// other field (e.g. the password) at the moment validation runs.
export function matches(getOtherValue, message) {
  return (value) => {
    if (value && value !== getOtherValue()) {
      return message
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
