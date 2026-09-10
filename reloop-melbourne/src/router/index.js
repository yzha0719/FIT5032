import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/recycling-hub', name: 'recycling-hub', component: () => import('../views/RecyclingHubView.vue') },
  { path: '/learning-centre', name: 'learning-centre', component: () => import('../views/LearningCentreView.vue') },
  { path: '/get-involved', name: 'get-involved', component: () => import('../views/GetInvolvedView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
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
router.beforeEach((to) => {
  const { isAuthenticated, hasRole } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Send guests to log in, then bring them back to the page they wanted.
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && !hasRole(...to.meta.roles)) {
    return { name: 'access-denied' }
  }
})

export default router
