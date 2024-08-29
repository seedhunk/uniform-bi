import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'

// 创建 pinia 实例
const pinia = createPinia()
pinia.use(piniaPersist)

// 默认导出，给 main.ts 使用
export default pinia

// 模块统一导出
export * from './modules/userDetail'
export * from './modules/timer'
export * from './modules/sale'
export * from './modules/size'
