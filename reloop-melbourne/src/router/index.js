import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/recycling-hub', name: 'recycling-hub', component: () => import('../views/RecyclingHubView.vue') },
  { path: '/learning-centre', name: 'learning-centre', component: () => import('../views/LearningCentreView.vue') },
  { path: '/get-involved', name: 'get-involved', component: () => import('../views/GetInvolvedView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
