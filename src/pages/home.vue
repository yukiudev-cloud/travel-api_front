<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-stretch sm:items-center p-3 sm:p-6">
    <div class="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-3 sm:p-6">

      <h1 class="mb-6 text-2xl sm:text-3xl font-bold mb-1 text-center text-gray-900">
        旅行プラン生成
      </h1>
      <div class="mb-3 ">
        <TravelIntro />
      </div>

      <div class="border rounded-2xl p-5 bg-white shadow space-y-4">
        <form @submit.prevent="generatePlan" class="space-y-3 mb-6">
          <!-- 行き先 -->
          <div class="space-y-1">
            <label for="destination" class="text-sm font-semibold text-gray-700">
              行き先、目的などを入力
            </label>
          </div>
          <input
            v-model="destination"
            id="destination"
            placeholder="例：東京 / 美味しいものを食べたい"
            class="w-full border rounded-lg p-2 bg-white text-black"
          />
          
          <!-- 日数 -->
          <div class="flex justify-center">
            <div class="w-full max-w-md">
              <div class="bg-gray-50 border rounded-xl p-4 space-y-3">
                <p class="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  日程を入力
                </p>

                <div class="flex flex-col sm:flex-row sm:items-end sm:justify-center gap-3 w-full">

                  <!-- 出発 -->
                  <div class="flex-1 flex flex-col">
                    <p class="text-xs text-gray-500 mb-1">出発</p>
                    <input
                      type="date"
                      id="startDate"
                      v-model="startDate"
                      :min="today"
                      class="w-full border rounded-lg bg-white text-black px-2 py-4 sm:px-3 sm:py-2 text-sm appearance-none"
                    />
                  </div>

                  <!-- 矢印 -->
                  <div class="text-gray-400 text-xl pb-2 sm:block hidden">→</div>
                  <div class="text-gray-400 text-xl text-center sm:hidden">↓</div>

                  <!-- 帰宅 -->
                  <div class="flex-1 flex flex-col">
                    <p class="text-xs text-gray-500 mb-1">帰宅</p>
                    <input
                      type="date"
                      id="endDate"
                      v-model="endDate"
                      :min="today"
                      class="w-full border rounded-lg bg-white text-black px-2 py-4 sm:px-3 sm:py-2 text-sm appearance-none"
                    />
                  </div>

                </div>
                
                <!-- 日数表示 -->
                <p v-if="days" class="text-sm text-emerald-600 font-semibold">
                  {{ days }}日間のプラン
                </p>
                <p v-if="!startDate || !endDate" class="text-xs text-gray-400">
                  日付を選択してください
                </p>
              </div>
            </div>
          </div>

          <!-- ボタン -->
          <button
            ref="resultRef"
            type="submit"
            :disabled="loading"
            class="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 transition text-white font-semibold p-3 rounded-xl shadow"
          >
            {{ loading ? "プラン思考中..." : "生成する" }}
          </button>
          <p v-if="!loading" class="text-xs text-gray-400 mt-2 text-center">
            ※生成には1分程度かかる場合があります
          </p>
        </form>
       </div> 
      <!-- 結果 -->
      <div  v-if="plan.length > 0"  class="border rounded-2xl p-5 bg-white shadow-md space-y-4"> 
        <div>
          <DayCard
            v-for="item in plan"
            :key="item.day"
            :item="item"
            :toFoodSearch="toFoodSearch"
          />
        </div>
        <!-- 宿 -->
        <div v-if="plan.length" class="border rounded-2xl p-5 bg-white shadow space-y-4">
          
          <p class="font-bold text-lg text-gray-800">
            おすすめ宿泊エリア
          </p>

          <div
            class="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition space-y-2"
          >
            
            <!-- エリア -->
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-gray-900">
                {{ hotelArea }}
              </p>
            </div>

            <!-- 理由 -->
            <p class="text-xs text-gray-600 leading-relaxed">
              {{hotelReason}}
            </p>

            <div class="flex gap-2 pt-2">
              <HotelList :hotels="hotels" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- ローディングオーバーレイ -->
  <div
    v-if="loading"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-2xl px-6 py-5 shadow-xl flex flex-col items-center gap-4">

      <!-- ぐるぐる -->
      <div
        class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
      ></div>

      <!-- テキスト -->
      <p class="text-sm font-semibold text-gray-700">
        AIが旅行プランを生成中...
      </p>
      <p class="text-xs text-gray-500 text-center">
        1分程度かかる場合があります。
      </p>
    </div>
  </div>
</template>

<script setup>
  import LZString from "lz-string"

  import Header from "../components/Header.vue"
  import TravelIntro from "../components/TravelIntro.vue"
  import DayCard from "../components/DayCard.vue";
  import HotelList from "../components/RakList.vue"

  import { ref, computed, watch, onMounted, onUnmounted } from "vue";

  import { nextTick } from "vue";
  import { usePlanStore } from "../stores/store"
  import { useToast } from "../composables/useToast"
  import { mockHotels } from "../mocks/rHotelMock"

  const API_URL = import.meta.env.VITE_API_URL

  const TEST_MODE = import.meta.env.VITE_TEST_MODE === "true"

  const R_APP_ID = import.meta.env.VITE_RAKUTEN_APP_ID
  const R_AFF_ID = import.meta.env.VITE_RAKUTEN_AFF_ID
  const R_ACS_KEY = import.meta.env.VITE_RAKUTEN_ACS_KEY

  const today = new Date().toISOString().split("T")[0];
  const loading = ref(false);
  const resultRef = ref(null)

  let controller = null

  // 画面起動中はバックエンドを起こす
  fetch(`${API_URL}/health`).catch(() => {})
  let pingInterval = null
  pingInterval = setInterval(() => {
    fetch(`${API_URL}/health`).catch(() => {})
  }, 4 * 60 * 1000)

  const { showToast } = useToast()
  //親にデータ渡す
  const store = usePlanStore()

  const destination = computed({
    get: () => store.destination,
    set: (v) => store.destination = v
  })

  const plan = computed({
    get: () => store.plan,
    set: (v) => store.plan = v
  })

  const endDate = computed({
    get: () => store.endDate,
    set: (v) => store.endDate = v
  })

  const startDate = computed({
    get: () => store.startDate,
    set: (v) => store.startDate = v
  })

  const hotels = computed({
    get: () => store.hotels,
    set: (v) => store.hotels = v
  })
  const hotelArea = computed({
    get: () => store.hotelArea,
    set: (v) => store.hotelArea = v
  })
  const hotelReason = computed({
    get: () => store.hotelReason,
    set: (v) => store.hotelReason = v
  })


  const days = computed(() => {
    if (!startDate.value || !endDate.value) return null;

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);

    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  });

  const dayText = computed(() => {
    return days.value ? `${days.value}日間` : "";
  });

  watch(
    () => plan.value,
    (newPlan) => {
      if (newPlan.length > 0) {
        const pageTitle = `${destination.value} ${days.value}日間モデルコース`
        document.title = pageTitle + " | 旅行プラン生成AI"

        const description = `${destination.value}の${days.value}日間の旅行プラン`

        const meta = document.querySelector('meta[name="description"]')
        if (meta) {
          meta.setAttribute("content", description)
        }
      }
    }
  );

  // 共有
  const decodePlan = (encoded) => {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    return JSON.parse(json)
  }

  onMounted( async () => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("data")

    if (encoded) {
      try {
        const decoded = decodePlan(encoded)

        store.destination = decoded.d || ""
        store.startDate = decoded.s || ""
        store.endDate = decoded.e || ""
        store.plan = decoded.p || []
        store.hotelArea = decoded.a || ""
        store.hotelReason = decoded.r || ""
        store.days = days.value
        if (!store.hotels || store.hotels.length === 0) {
          await fetchHotels(hotelArea.value)
        }
      } catch (e) {
        console.error("復元失敗", e)
      }
    }
  });
  onUnmounted(() => {
  if (controller) {
    controller.abort()
  }

  if (pingInterval) {
    clearInterval(pingInterval)
  }
});

  const hotelAreas = computed(() => {
    const areas = plan.value.map(p => p.hotel_area)
    return [...new Set(areas)]
  })

  // 食べ物
  const toFoodSearch = (food, where) => {
    return `https://www.google.com/search?q=${encodeURIComponent(`${where} ${food} おすすめ`)}`
  }

  // サニタイズ
  const cleanInput = (text) => {
    return text
      .normalize("NFKC")               // 全角→半角
      .replace(/[\r\n]+/g, " ")        // 改行削除
      .replace(/\s+/g, " ")            // 空白整理
      .replace(/[<>{}[\]`\\]/g, "")    // 危険な記号だけ除去
      .trim()
      .slice(0, 100);
  };

  // プラン生成
  const generatePlan = async () => {
    if (loading.value) return

    const cleaned = cleanInput(destination.value);
    destination.value = cleaned;
    if (!cleaned) {
      showToast("行き先を入力してください", "error");
      return;
    }

    if (!startDate.value || !endDate.value) {
      showToast("日付を選択してください", "error");
      return;
    }
    if (new Date(endDate.value) < new Date(startDate.value)) {
      showToast("帰宅日を出発日以降にしてください", "error");
      return;
    }
    if (days.value > 7) {
      showToast("7日以内で作成してください（精度と品質のため）", "error");
      return;
    }

    if (controller) {
      controller.abort()
    }
    controller = new AbortController()

    loading.value = true;
    
    store.days = days.value
    try {
      const res = await fetch(`${API_URL}/generate-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          destination: cleaned,
          days: days.value
        }),
        signal: controller.signal
      });

      const data = await res.json();
      plan.value = [];
      if (!res.ok || data.error) {
        showToast(data.error || "サーバーエラー", "error");
        return;
      } else {
        plan.value = data.plan;
        store.destination = cleaned
        store.days = days.value
        store.plan = plan.value
        store.hotelArea = data.hotel_area
        store.hotelReason = data.hotel_reason
        await fetchHotels(hotelArea.value)
        showToast("プラン生成 成功！！", "success");
        await nextTick()

        resultRef.value?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        })
      }
      
    } catch (e) {
      if (e.name === "AbortError") {
        console.log("通信キャンセル")
        return
      }
      showToast("通信エラー", "error");
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const fetchHotels = async (area) => {
    if (TEST_MODE) {
      hotels.value = mockHotels
      store.hotels = mockHotels

      console.log("mock hotel")
      return
    }

    const url = `https://openapi.rakuten.co.jp/engine/api/Travel/KeywordHotelSearch/20170426`

    const params = new URLSearchParams({
      format: "json",
      keyword: area,
      hotelThumbnailSize: 2,
      sort: "+roomCharge",
      applicationId: R_APP_ID,
      affiliateId: R_AFF_ID,
      accessKey: R_ACS_KEY,
      hits: 4
    })

    const res = await fetch(`${url}?${params.toString()}`)
    const data = await res.json()
    hotels.value = data.hotels.map(h => {
      const info = h.hotel[0].hotelBasicInfo

      return {
        name: info.hotelName,
        url: info.hotelInformationUrl,
        img: info.hotelImageUrl,
        spe: info.hotelSpecial
      }
    })
    store.hotels = hotels.value
  }

</script>