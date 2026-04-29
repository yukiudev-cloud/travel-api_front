//メッセージ共通
import { ref } from "vue"

const toastMessage = ref("")
const toastType = ref("error")
let timer = null

export const useToast = () => {

  const showToast = (msg, type = "error") => {
    toastMessage.value = msg
    toastType.value = type

    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      toastMessage.value = ""
    }, 3000)
  }

  return {
    toastMessage,
    toastType,
    showToast
  }
};
