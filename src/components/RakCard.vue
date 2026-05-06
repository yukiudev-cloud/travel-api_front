<template>
  <div class="border rounded-2xl p-4 bg-white shadow hover:shadow-md transition flex flex-col justify-between">

    <!-- タイトル -->
    <p class="font-bold text-sm text-gray-900 line-clamp-2 mb-2">
      {{ hotel.name_R }}
    </p>
    <!-- 画像 + クレジット -->
    <div class="relative">
      <a :href="hotel.url_R" target="_blank">
        <img
          :src="hotel.img_R"
          alt="hotel image"
          class="w-full h-40 object-cover rounded-lg"
        />
      </a>
      <!-- 楽天クレジット（左下必須） -->
      <div class="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
        楽天トラベル
      </div>
    </div>
    <!-- 説明（軽め） -->
    <p class="text-xs text-gray-500 mb-3">
      {{hotel.spe_R}}
    </p>
    <div class="mt-auto flex gap-2">
      <a
        :href="hotel.url_R"
        target="_blank"
        class="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg transition"
      >
        楽天で見る
      </a>
    </div>

  </div>
</template>

<script setup>
const props = defineProps({
  hotel: Object
})
</script>