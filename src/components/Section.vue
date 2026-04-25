<template>
  <div class="border rounded-2xl p-6 bg-white shadow-sm space-y-6">
    <div class="space-y-2">
      <div class="text-sm text-gray-500">
        {{ data.time }}
      </div>

      <div class="font-semibold text-gray-800">
        {{ data.where }}
      </div>

      <div class="text-gray-600 text-sm">
        {{ data.activity }}
      </div>

      <div v-if="data.meal" class="flex flex-wrap gap-2 mt-2">
        <a
          v-for="food in data.meal"
          :key="food"
          :href="toFoodSearch(food, data.where)"
          target="_blank"
          class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs"
        >
          🍽 {{ food }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    data: Object,
    toFoodSearch: Function
  })
</script>