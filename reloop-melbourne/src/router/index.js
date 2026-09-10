import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/recycling-hub', name: 'recycling-hub', component: () => import('../views/RecyclingHubView.vue') },
  { path: '/learning-centre', name: 'learning-centre', component: () => import('../views/LearningCentreView.vue') },
  { path: '/get-involved', name: 'get-involved', component: () => import('../views/GetInvolvedView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },

  // Account pages. `meta.roles` lists who may open each page. The navbar reads it
  // to decide which links to show; the route guard (next step) will enforce it.
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

export default router
