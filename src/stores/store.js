import { defineStore } from "pinia"

export const usePlanStore = defineStore("plan", {
  state: () => ({
    destination: "",
    days: 1,
    plan: []
  })
})