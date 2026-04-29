<template>
  <header class="sticky top-0 z-50 bg-white border-b shadow-sm">
    <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">

      <!-- 左 -->
      <h1 class="font-bold text-lg text-gray-800">
        旅行プラン生成AI
      </h1>

      <!-- 中 -->
      <div v-if="store.plan.length" class="text-sm text-gray-600">
        {{ store.destination }} / {{ store.days }}日間
      </div>

      <!-- 右 -->
      <div class="flex gap-2">
        <button
          v-if="store.plan.length"
          @click="emit('share')"
          class="text-xs bg-emerald-500 text-white px-3 py-1 rounded"
        >
          共有リンクをコピー
        </button>
      </div>

    </div>
  </header>
</template>

<script setup>
  import { usePlanStore } from "../stores/store"

  const store = usePlanStore()
  const emit = defineEmits(["share"])
</script>