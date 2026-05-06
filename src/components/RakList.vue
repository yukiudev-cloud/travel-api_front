<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <HotelCard
      v-for="h in hotels"
      :key="h.url"
      :hotel="h"
    />
  </div>
</template>

<script setup>
  import HotelCard from "./RakCard.vue"

  defineProps({
    hotels: {
      type: Array,
      default: () => []
    }
  })
</script>