import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", component: () => import("../pages/Home.vue") },
  { path: "/privacy", component: () => import("../pages/Privacy.vue") },
  { path: "/contact", component: () => import("../pages/Contact.vue") }
]

const router = createRouter({
  history: createWebHistory("/travel-api_front/"),
  routes,
})

export default router