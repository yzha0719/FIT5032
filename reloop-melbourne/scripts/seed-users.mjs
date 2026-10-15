// One-off setup script: creates the three demo accounts in Firebase
// Authentication and their profile documents in Firestore.
//
//   node scripts/seed-users.mjs
//
// It uses the normal client SDK, so it can only do what any visitor could do:
// create an account and write that account's own profile. The admin role is
// NOT set here — the rules reject it. Promote admin@example.com by hand in the
// Firebase console (Firestore → users → that document → role: "admin").
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../src/firebase.js'

const PASSWORD = 'Passw0rd!'

const demoUsers = [
  { name: 'Priya Shah', email: 'priya@example.com', role: 'member' },
  { name: 'Jack Thompson', email: 'jack@example.com', role: 'volunteer' },
  // Created as a member, then promoted to admin in the console.
  { name: 'Admin User', email: 'admin@example.com', role: 'member' },
]

for (const user of demoUsers) {
  try {
    let credential
    try {
      credential = await createUserWithEmailAndPassword(auth, user.email, PASSWORD)
      console.log(`created auth account: ${user.email}`)
    } catch (error) {
      if (error.code !== 'auth/email-already-in-use') throw error
      credential = await signInWithEmailAndPassword(auth, user.email, PASSWORD)
      console.log(`auth account already existed: ${user.email}`)
    }

    await updateProfile(credential.user, { displayName: user.name })
    await setDoc(doc(db, 'users', credential.user.uid), {
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: serverTimestamp(),
    })
    console.log(`  profile written: ${user.role.padEnd(9)} uid ${credential.user.uid}`)
    await signOut(auth)
  } catch (error) {
    console.error(`FAILED for ${user.email}:`, error.code ?? error.message)
  }
}

console.log('\nDone. Now promote admin@example.com in the Firebase console:')
console.log('  Firestore → users → the document whose email is admin@example.com → role: "admin"')
process.exit(0)
