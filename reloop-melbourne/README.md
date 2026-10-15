# reloop-melbourne

ReLoop Melbourne is a Vue 3 web app for a fictional Melbourne not-for-profit working on
recycling and the circular economy (FIT5032 assignment project).

## Demo accounts

The three seed accounts all use the password `Passw0rd!`. You can also register a new
Community Member or Volunteer account from the Log in page.

| Role             | Email             |
| ---------------- | ----------------- |
| Community Member | priya@example.com |
| Volunteer        | jack@example.com  |
| Administrator    | admin@example.com |

You can also sign in with Google.

## Backend

Authentication and account data run on Firebase (project `reloop-melbourne-78b45`):

- **Firebase Authentication** handles sign-in, sign-up and sessions, so this app never
  stores a password itself.
- **Cloud Firestore** holds each account's profile at `users/{uid}`, including its role.
  The role is read from there, never from anything the browser could edit.
- **Security rules** are in [firestore.rules](firestore.rules): people can only read their
  own profile (admins can read all), can only create their own, and can never change their
  own role. The admin role is granted from the Firebase console.

Ratings and volunteer shift sign-ups are still kept in the browser's localStorage.

The Firebase config in `src/firebase.js` is not a secret: it identifies the project and is
meant to ship with client code. Access is controlled by the rules above.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
