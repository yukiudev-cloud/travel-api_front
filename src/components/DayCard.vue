<template>
  <div class="border rounded-2xl p-5 bg-gray-50 shadow space-y-4">

    <!-- ヘッダー -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold bg-emerald-500 text-white px-2 py-1 rounded">
          Day {{ item.day }}
        </h2>
        <p class="text-sm text-gray-600">
          {{ item.area }}
        </p>
      </div>

      <a
        :href="toMapUrl(item.area)"
        target="_blank"
        class="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
      >
        MAP
      </a>
    </div>

    <!-- コンテンツ -->
    <div class="space-y-4">
      <Section :data="item.morning" :toFoodSearch="toFoodSearch" />
      <Section :data="item.afternoon" :toFoodSearch="toFoodSearch" />
      <Section :data="item.night" :toFoodSearch="toFoodSearch" />
    </div>

  </div>
</template>

<script setup>
  import Section from "./Section.vue"

  // GoogleマップURL生成
  const toMapUrl = (query) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  defineProps({
    item: Object,
    toFoodSearch: Function
  })
</script>