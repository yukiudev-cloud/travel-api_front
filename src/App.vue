<template>
  <Header /> 
  <div
    v-if="toastMessage"
    class="fixed top-24 right-16 text-white px-10 py-3 rounded-lg shadow-lg z-50"
    :class="toastType === 'success' ? 'bg-emerald-500' : 'bg-red-500'"
  >
    {{ toastMessage }}
  </div>
  <router-view />
  <Footer />
</template>

<script setup>
  import Header from "./components/Header.vue"
  import Footer from "./components/Footer.vue"
  import { useToast } from "./composables/useToast"

  const { toastMessage, toastType } = useToast()
</script>