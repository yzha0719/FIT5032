import { ref, watch } from 'vue'

/**
 * A small reactive wrapper around localStorage.
 * Reads the initial value (if any) on creation, and writes back to
 * localStorage whenever the reactive value changes.
 */
export function useLocalStorageState(key, defaultValue) {
  let initial = defaultValue
  try {
    const raw = window.localStorage.getItem(key)
    if (raw !== null) {
      initial = JSON.parse(raw)
    }
  } catch (err) {
    console.warn(`Could not read localStorage key "${key}":`, err)
  }

  const state = ref(initial)

  watch(
    state,
    (value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (err) {
        console.warn(`Could not write localStorage key "${key}":`, err)
      }
    },
    { deep: true },
  )

  return state
}
