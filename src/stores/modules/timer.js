import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义 Store
export const useTimerStore = defineStore(
  'timer',
  () => {
    let count = ref(60)
    let intervalId
    const timer = () => {
      count.value--

      if (count.value === 0) {
        clearInterval(intervalId)
        count.value = 60
      }
    }

    const setTimer = () => {
      intervalId = setInterval(timer, 1000)
    }

    const checkTimer = () => {
      if (count.value !== 60) {
        if (intervalId) {
          clearInterval(intervalId)
        }
        intervalId = setInterval(timer, 1000)
      }
    }

    // 记得 return
    return {
      count,
      setTimer,
      checkTimer
    }
  },
  {
    persist: {
      enabled: true
    }
  }
)
