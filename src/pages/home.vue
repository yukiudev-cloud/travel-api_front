<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-stretch sm:items-center p-3 sm:p-6">
    <div class="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-3 sm:p-6">
      
      <h1 class="text-2xl font-bold mb-6 text-center text-black">
        旅行プラン生成
      </h1>

      <form @submit.prevent="generatePlan" class="space-y-3 mb-6">
        <!-- 行き先 -->
        <label>
          行き先、プランなどを入力
        </label>

        <input
          v-model="destination"
          placeholder="行き先"
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
                    v-model="startDate"
                    :min="today"
                    class="w-full border rounded-lg p-2 bg-white text-black"
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
                    v-model="endDate"
                    :min="today"
                    class="w-full border rounded-lg p-2 bg-white text-black"
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

      </form>
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
            v-for="area in hotelAreas"
            :key="area"
            class="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition space-y-2"
          >
            
            <!-- エリア -->
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-gray-900">
                {{ area }}
              </p>
            </div>

            <!-- 理由 -->
            <p class="text-xs text-gray-600 leading-relaxed">
              {{ plan.find(p => p.hotel_area === area)?.hotel_reason }}
            </p>

            <!-- ボタン -->
            <div class="flex gap-2 pt-2">
              
              <a
                :href="hotelLinks(area).rakuten"
                target="_blank"
                class="flex-1 text-center bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition"
              >
                楽天で探す
              </a>

              <a
                :href="hotelLinks(area).booking"
                target="_blank"
                class="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg transition"
              >
                Booking
              </a>

            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
  import LZString from "lz-string"
  import Header from "../components/Header.vue"
  import { ref, computed, watch, onMounted } from "vue";
  import DayCard from "../components/DayCard.vue";
  import { nextTick } from "vue";
  const API_URL = import.meta.env.VITE_API_URL
  const today = new Date().toISOString().split("T")[0];
  const loading = ref(false);
  import { usePlanStore } from "../stores/store"
  import { useToast } from "../composables/useToast"

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

  onMounted(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("data")

    if (encoded) {
      try {
        const decoded = decodePlan(encoded)

        store.destination = decoded.d || ""
        store.startDate = decoded.s || ""
        store.endDate = decoded.e || ""
        store.plan = decoded.p || []
        store.days = days.value

      } catch (e) {
        console.error("復元失敗", e)
      }
    }
  });

  // ホテル生成
  const resultRef = ref(null);
  const hotelLinks = computed(() => (area) => {
    const encoded = encodeURIComponent(area)

    return {
      rakuten: `https://travel.rakuten.co.jp/yado/?f_query=${encoded}&f_checkin=${startDate.value}&f_checkout=${endDate.value}`,
      booking: `https://www.booking.com/searchresults.ja.html?ss=${encoded}&checkin=${startDate.value}&checkout=${endDate.value}`
    }
  })

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
    loading.value = true;
    plan.value = [];
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
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast(data.error || "サーバーエラー", "error");
        return;
      } else {
        plan.value = data.plan;
        store.destination = cleaned
        store.days = days.value
        store.plan = plan.value
        showToast("プラン生成 成功！！", "success");
        nextTick(() => {
          resultRef.value?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        });
      }
      
    } catch (e) {
      showToast("通信エラー", "error");
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
</script>