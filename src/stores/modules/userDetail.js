import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义 Store
export const useUserStore = defineStore(
  'user',
  () => {
    // 会员信息
    const profileInfo = ref()

    // 保存会员信息，登录时使用

    const setProfileInfo = (val) => {
      val.auth_list = val.auth_list.slice(2, -2).split('","')
      profileInfo.value = val
    }

    // 清理会员信息，退出时使用
    const clearProfile = () => {
      profileInfo.value = ''
      localStorage.removeItem('login')
    }

    // 记得 return
    return {
      profileInfo,
      setProfileInfo,
      clearProfile
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'profileInfo',
          storage: sessionStorage,
          paths: ['profileInfo']
        }
      ]
    }
  }
)
