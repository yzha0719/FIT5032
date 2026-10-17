# ReLoop Melbourne

A Vue 3 web application for a fictional Melbourne not-for-profit working on recycling,
repair and the circular economy (FIT5032 assignment project).

**Live site: https://reloop-melbourne-78b45.web.app**

All content — events, locations, ratings, team members, impact figures — is invented for
this assignment. The suburbs and street addresses are real places, but the services at
them are not.

## Demo accounts

The three seed accounts all use the password `Passw0rd!`. You can also register a new
Community Member or Volunteer account from the Log in page, or sign in with Google.

| Role             | Email             |
| ---------------- | ----------------- |
| Community Member | priya@example.com |
| Volunteer        | jack@example.com  |
| Administrator    | admin@example.com |

## What runs where

The browser handles the interface and the first round of validation. Anything involving a
secret, another person's data, or a decision that has to be trusted runs on the server.

**Firebase Authentication** handles sign-in, sign-up and sessions, so this app never
stores a password itself.

**Cloud Firestore** holds each account's profile at `users/{uid}` including its role, the
account totals at `stats/overview`, and the event and location catalogue the public API
serves. [firestore.rules](firestore.rules) is where access is decided: people can read
only their own profile (admins can read all), can never change their own role, and the
catalogue collections are closed to browsers entirely.

**Cloud Functions** (`australia-southeast1`, see [functions/](functions)):

| Function | Trigger | What it does |
| --- | --- | --- |
| `emailMyShifts` | callable | Emails a volunteer their own shifts with a CSV attached |
| `emailMembers` | callable | Admin-only bulk email, one personalization per recipient |
| `setUserRole` | callable | Admin-only role change, with the permission check on the server |
| `countAccountsByRole` | Firestore event | Rebuilds `stats/overview` whenever an account changes |
| `api` | HTTP | The public open-data API below |

**Firebase Hosting** serves the built site, rewrites `/api/**` to the `api` function, and
sets cache headers: no-cache on the HTML so a deploy is live immediately, and a one-year
immutable cache on the content-hashed assets.

## Open data API

Read-only, no key, open to any origin. Documentation and a live console are at
[`/developers`](https://reloop-melbourne-78b45.web.app/developers).

```
GET /api                                         # index of endpoints
GET /api/events?suburb=&category=&when=&limit=   # when: all | upcoming | past
GET /api/locations?suburb=&type=&accepts=&limit= # includes coordinates
```

Anything other than GET returns 405. Responses are cached for five minutes.

## Running it locally

```sh
npm install
npm run dev
```

`.env` holds the Mapbox token used by the locator map and is included with this submission
so the map works without any setup. It is git-ignored; `.env.example` shows the shape.

The dev server proxies `/api` to the deployed function, so the open-data console on
`/developers` works locally too.

To work on the Cloud Functions, install their dependencies separately:

```sh
cd functions
npm install
```

### Other commands

```sh
npm run build          # production build into dist/
npm run lint           # ESLint
node scripts/seed-users.mjs     # create the three demo accounts
node scripts/seed-content.mjs   # publish the catalogue to Firestore for the API
```

The admin role cannot be chosen at registration — the rules reject it. It is granted by an
existing administrator from the Accounts table on `/admin`, which calls the `setUserRole`
function. The very first administrator was set by hand in the Firebase console.

## Notes

- Ratings and volunteer shift sign-ups are kept in the browser's localStorage, so they do
  not follow a user between devices. Accounts, roles and the catalogue are in Firestore.
- The Firebase config in `src/firebase.js` is not a secret: it identifies the project and
  is meant to ship with client code. Access is controlled by the security rules.
- Bootstrap is loaded for its base stylesheet only. Every layout in this project is
  hand-written CSS Grid.

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).
