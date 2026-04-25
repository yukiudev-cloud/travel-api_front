<template>
  <header class="sticky top-0 z-50 bg-white border-b shadow-sm">
    <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">

      <!-- 左 -->
      <h1 class="font-bold text-lg text-gray-800">
        旅行プラン生成AI
      </h1>

      <!-- 中 -->
      <div v-if="destination && days" class="text-sm text-gray-600">
        {{ destination }} / {{ days }}日間
      </div>

      <!-- 右 -->
      <div class="flex gap-2">
        <button
          v-if="plan.length"
          @click="sharePlan"
          class="text-xs bg-emerald-500 text-white px-3 py-1 rounded"
        >
          共有
        </button>

        <button
          @click="reset"
          class="text-xs bg-gray-200 px-3 py-1 rounded"
        >
          リセット
        </button>
      </div>

    </div>
  </header>
</template>

<script setup>
  defineProps({
    destination: String,
    days: Number,
    plan: Array,
    sharePlan: Function
  })

  const emit = defineEmits(["reset"])

  const reset = () => {
    emit("reset")
  }
</script>