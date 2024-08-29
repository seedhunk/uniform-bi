import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义 Store
export const useSizeStore = defineStore('size', () => {
  const size = ['s', 'm', 'x', 'xl', 'xxl', 'xxxl']
  const product = ref([
    'product1',
    'product2',
    'product3',
    'product4',
    'product5',
    'product6',
    'product7',
    'product8',
    'product9',
    'product10'
  ])
  const sizeData = ref(
    product.value.map((item) => {
      return {
        name: item,
        data: size.map((item) => {
          return {
            value: Math.floor(Math.random() * (100 - 10 + 1)) + 30,
            name: item
          }
        })
      }
    })
  )

  // 记得 return
  return {
    sizeData,
    product
  }
})
