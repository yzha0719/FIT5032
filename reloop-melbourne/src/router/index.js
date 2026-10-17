import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, waitForAuth } from '../composables/useAuth'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/recycling-hub', name: 'recycling-hub', component: () => import('../views/RecyclingHubView.vue') },
  { path: '/learning-centre', name: 'learning-centre', component: () => import('../views/LearningCentreView.vue') },
  { path: '/get-involved', name: 'get-involved', component: () => import('../views/GetInvolvedView.vue') },
  { path: '/locator', name: 'locator', component: () => import('../views/LocatorView.vue') },
  { path: '/events', name: 'events', component: () => import('../views/EventsView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
  {
    path: '/developers',
    name: 'developers',
    component: () => import('../views/DeveloperApiView.vue')
  },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  {
    path: '/access-denied',
    name: 'access-denied',
    component: () => import('../views/AccessDeniedView.vue')
  },

  // Account pages. `meta.roles` lists who may open each page. The navbar reads it
  // to decide which links to show, and the beforeEach guard below enforces it.
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['member', 'volunteer', 'admin'] }
  },
  {
    path: '/volunteer-shifts',
    name: 'volunteer-shifts',
    component: () => import('../views/VolunteerShiftsView.vue'),
    meta: { requiresAuth: true, roles: ['volunteer', 'admin'] }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  // Anything that matched none of the routes above. Hosting rewrites every URL
  // to index.html so the app can handle its own routing, which means a mistyped
  // address arrives here rather than at a server 404. Must stay last.
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Runs before every navigation, including typing a URL or refreshing the page.
// Hiding links in the navbar is only a convenience; this is what actually stops
// someone opening /admin without the admin role.
router.beforeEach(async (to) => {
  // Firebase restores the signed-in user asynchronously, so on a page refresh
  // the guard has to wait for that before deciding anything.
  await waitForAuth()
  const { isAuthenticated, hasRole } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Send guests to log in, then bring them back to the page they wanted.
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && !hasRole(...to.meta.roles)) {
    return { name: 'access-denied' }
  }
})

// A single-page app never reloads, so the title has to be updated by hand.
// Screen reader users hear it on every navigation, and it names the tab.
const pageTitles = {
  home: 'Home',
  about: 'About us',
  'recycling-hub': 'Recycling hub',
  locator: 'Find a drop-off or repair point',
  events: 'Workshops & events',
  'learning-centre': 'Learning centre',
  'get-involved': 'Get involved',
  contact: 'Contact',
  developers: 'Developer API',
  login: 'Log in or register',
  dashboard: 'My dashboard',
  'volunteer-shifts': 'Volunteer shifts',
  admin: 'Admin overview',
  'access-denied': 'Access denied',
  'not-found': 'Page not found',
}

// A single-page app never reloads, so focus stays wherever it was when the
// link was clicked: a screen reader carries on reading the page the visitor has
// just left, and the next Tab continues from the old position. Moving focus to
// <main> makes a route change behave like a real page load, and the new title
// is announced with it. The first navigation is left alone — on a fresh load
// focus belongs at the top of the document, where the skip link is.
let isFirstNavigation = true

router.afterEach((to) => {
  const page = pageTitles[to.name]
  document.title = page ? `${page} · ReLoop Melbourne` : 'ReLoop Melbourne'

  if (isFirstNavigation) {
    isFirstNavigation = false
    return
  }

  nextTick(() => {
    document.getElementById('main-content')?.focus()
  })
})

export default router
