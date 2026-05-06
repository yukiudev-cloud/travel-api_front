import { defineStore } from "pinia"

export const usePlanStore = defineStore("plan", {
  state: () => ({
    destination: "",
    startDate: "",
    endDate: "",
    plan: [],
    hotelArea: "",
    hotelReason: "",
    hotels: [],
    days: null
  })
})