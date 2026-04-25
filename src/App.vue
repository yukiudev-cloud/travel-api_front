<template>
  <Header
    :destination="destination"
    :days="days"
    :plan="plan"
    :sharePlan="sharePlan"
    @reset="plan = []"
  />
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
    <div class="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">
      
      <h1 class="text-2xl font-bold mb-6 text-center">
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
          class="w-full border rounded-lg p-3"
        />
        
        <!-- 日数 -->
        <div class="flex justify-center">
          <div class="w-full max-w-md">
            <div class="bg-gray-50 border rounded-xl p-4 space-y-3">
              <p class="text-sm font-semibold text-gray-700 flex items-center gap-1">
                日程を入力
              </p>

              <div class="flex items-center gap-3">
                <!-- 出発 -->
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">出発日</p>
                  <input
                    type="date"
                    v-model="startDate"
                    :min="today"
                    class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                  />
                </div>

                <!-- 矢印 -->
                <div class="text-gray-400 text-xl mt-5">→</div>

                <!-- 帰宅 -->
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">帰宅日</p>
                  <input
                    type="date"
                    v-model="endDate"
                    :min="today"
                    class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400 outline-none"
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
          type="submit"
          :disabled="loading"
          class="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 transition text-white font-semibold p-3 rounded-xl shadow"
        >
          {{ loading ? "プラン思考中..." : "生成する" }}
        </button>
        <div
          v-if="errorMessage"
          class="fixed top-24 right-16 bg-red-500 text-white px-10 py-3 rounded-lg shadow-lg z-50"
        >
          {{ errorMessage }}
        </div>


      </form>
      <!-- 結果 -->
      <div v-if="plan.length > 0"  class="border rounded-2xl p-5 bg-white shadow-md space-y-4">
      
        <button
          v-if="plan.length"
          @click="sharePlan"
          class="w-full flex items-center justify-center gap-2
                bg-gradient-to-r from-emerald-500 to-teal-500
                hover:from-emerald-600 hover:to-teal-600
                text-white font-semibold p-3 rounded-xl
                shadow-md active:scale-95 transition"
        >
          🔗 {{ copied ? "コピー完了" : "共有リンクをコピー" }}
        </button>
        
        <!-- 宿 -->
        <div v-if="plan.length" class="border rounded-2xl p-5 bg-white shadow space-y-4">
          
          <p class="font-bold text-lg text-gray-800">
            🏨 おすすめ宿泊エリア
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

        <div>
          <DayCard
            v-for="item in plan"
            :key="item.day"
            :item="item"
            :toFoodSearch="toFoodSearch"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import Header from "./components/Header.vue"
  import { ref, computed, watch, onMounted } from "vue";
  import DayCard from "./components/DayCard.vue";
  const API_URL = import.meta.env.VITE_API_URL
  const today = new Date().toISOString().split("T")[0];
  const destination = ref("");
  const plan = ref([]);
  const loading = ref(false);
  const errorMessage = ref("");
  const startDate = ref("");
  const endDate = ref("");

  const days = computed(() => {
    if (!startDate.value || !endDate.value) return null;

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);

    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  });

  const dayText = computed(() => {
    return days.value ? `${days.value}日間` : "";
  });

  const showError = (msg) => {
    errorMessage.value = msg;

    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  };

  watch(plan, (newPlan) => {
    if (newPlan.length > 0) {
      const pageTitle = `${destination.value} ${days.value}日間モデルコース`;
      document.title = pageTitle + " | 旅行プラン生成AI";

      const description = `${destination.value}の${days.value}日間の旅行プラン。観光・グルメ・移動を考慮した実用的なモデルコース。`;

      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
    }
  });

  // 共有
  const encodePlan = (plan) => {
    return encodeURIComponent(
      btoa(unescape(encodeURIComponent(JSON.stringify(plan))))
    );
  };
  const copied = ref(false);

  const sharePlan = async () => {
    const encoded = encodePlan(plan.value);
    const url = `${window.location.origin}?plan=${encoded}`;

    await navigator.clipboard.writeText(url);

    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  };
  const decodePlan = (encoded) => {
    return JSON.parse(
      decodeURIComponent(
        escape(atob(decodeURIComponent(encoded)))
      )
    );
  };
  onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("plan");

    if (encoded) {
      try {
        plan.value = decodePlan(encoded);
      } catch (e) {
        console.error("復元失敗", e);
      }
    }
  });

  // ホテル生成
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
      showError("行き先を入力してください");
      return;
    }

    if (!startDate.value || !endDate.value) {
      showError("日付を選択してください");
      return;
    }
    if (new Date(endDate.value) < new Date(startDate.value)) {
      showError("帰宅日を出発日以降にしてください");
      return;
    }
    if (days.value > 7) {
      showError("7日以内で作成してください（精度と品質のため）");
      return;
    }
    loading.value = true;
    plan.value = [];
    
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
        showError(data.error || "サーバーエラー");
        return;
      }

      plan.value = data.plan;

    } catch (e) {
      showError("通信エラー");
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
</script>