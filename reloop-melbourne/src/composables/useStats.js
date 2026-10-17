import { ref } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

// BR E.1: these numbers are not worked out here. The countAccountsByRole
// Cloud Function rebuilds them in Firestore whenever an account changes, and
// the listener below receives the new document as soon as that write lands —
// so the admin page reads one small document instead of every user.
//
// It stays null until the function has run at least once, and when a visitor
// isn't allowed to read it. Callers fall back to counting locally, so the page
// still works before the first rebuild.
const roleStats = ref(null)

function watchRoleStats() {
  return onSnapshot(
    doc(db, 'stats', 'overview'),
    (snapshot) => {
      roleStats.value = snapshot.exists() ? snapshot.data() : null
    },
    () => {
      roleStats.value = null
    },
  )
}

export function useStats() {
  return { roleStats, watchRoleStats }
}
