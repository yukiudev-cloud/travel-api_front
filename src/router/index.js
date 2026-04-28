import { createRouter, createWebHashHistory } from "vue-router"

const routes = [
  { path: "/", component: () => import("../pages/home.vue") },
  { path: "/privacy", component: () => import("../pages/privacy.vue") },
  { path: "/contact", component: () => import("../pages/contact.vue") }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router