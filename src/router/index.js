import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", component: () => import("../pages/home.vue") },
  { path: "/privacy", component: () => import("../pages/privacy.vue") },
  { path: "/contact", component: () => import("../pages/contact.vue") }
]

const router = createRouter({
  history: createWebHistory("/travel-api_front/"),
  routes,
})

export default router