 <template>
  <footer class="bg-gray-100 border-t mt-10">
    <div class="max-w-3xl mx-auto p-6 text-sm text-gray-600 flex flex-col sm:flex-row justify-between gap-4">

      <div>
        <p class="font-semibold text-gray-800">旅行プラン生成AI</p>
        <p class="text-xs mt-1">AIで旅行プランを自動生成するサービス</p>
      </div>
      <div class="flex flex-col gap-2">
        <router-link to="/">トップ</router-link>
        <router-link to="/privacy">プライバシーポリシー</router-link>
        <router-link to="/contact">お問い合わせ</router-link>
      </div>

    </div>

    <div class="text-center text-xs text-gray-400 pb-4">
      © 2026 Travel AI
    </div>
  </footer>
</template>
