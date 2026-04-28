<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click="close"
  >

    <div
      class="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl"
      @click.stop
    >
      <slot />
    </div>

  </div>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(["close"])

const close = () => {
  emit("close")
}
</script>


