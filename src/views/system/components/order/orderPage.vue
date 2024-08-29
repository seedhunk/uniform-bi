<script setup>
import { markRaw, ref, computed, getCurrentInstance, onMounted } from 'vue'
import orderList from './components/orderList.vue'
import orderDetail from './components/orderDetail.vue'

const blocks = ref([
  {
    block: markRaw(orderList),
    show: true
  },
  {
    block: markRaw(orderDetail),
    show: false
  }
])
const activeIndex = ref(0)
const activeBlock = computed(() => blocks.value[activeIndex.value])
const bId = ref()
//子组件如果需要提示这里会将state修改为true
var state = false
const changeTheCheck = (e) => {
  state = e
}
const instance = getCurrentInstance()
const changeBlock = (idx, orderId, protect) => {
  if (idx === 0) {
    if (state && !protect) {
      instance.proxy.$buefy.dialog.confirm({
        message: 'Are you sure to exit without updating?',
        canCancel: ['button'],
        onConfirm: () => {
          blocks.value[1].show = false
          state = false
          activeIndex.value = idx
        }
      })
    } else {
      blocks.value[1].show = false
      activeIndex.value = idx
    }
  } else {
    blocks.value[1].show = true
    activeIndex.value = idx
    bId.value = orderId
  }
}

onMounted(() => {
  if (instance.proxy.$route.query.id) {
    changeBlock(1, Number(instance.proxy.$route.query.id))
  }
})
</script>

<template>
  <!-- 顶部引导栏 -->
  <div class="breadcrumb">
    <div class="breadcrumb-title" @click="changeBlock(0)">Order</div>
    <div class="breadcrumb-item" v-if="blocks[1].show">View detail</div>
  </div>

  <!-- 组件渲染入口 -->
  <div class="main">
    <component
      :is="activeBlock.block"
      @onChangeBlock="changeBlock"
      @onChangeTheCheck="changeTheCheck"
      :id="bId"
    ></component>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

@media (min-width: 1200px) {
  .breadcrumb {
    height: 5%;
    padding: 12px 60px;
    width: 100%;
    display: flex;
    margin: 0;

    &-title {
      color: $medium;
      font-size: 16px;
      cursor: pointer;
      text-decoration: underline;

      &:hover {
        color: $primary;
      }
    }

    &-item {
      font-size: 16px;
      text-align: center;
      padding: 0 5px;
      cursor: pointer;
      color: $medium;

      &:hover {
        color: $primary;
      }

      &::before {
        content: '/';
        padding-right: 10px;
        font-size: 16px;
      }
    }
  }

  .main {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
}

@media (max-width: 1200px) {
  .breadcrumb {
    height: 5%;
    padding: 6px 60px;
    width: 100%;
    display: flex;
    margin: 0;

    &-title {
      color: $medium;
      font-size: 16px;
      cursor: pointer;
      text-decoration: underline;

      &:hover {
        color: $primary;
      }
    }

    &-item {
      font-size: 16px;
      text-align: center;
      padding: 0 5px;
      cursor: pointer;
      color: $medium;

      &:hover {
        color: $primary;
      }

      &::before {
        content: '/';
        padding-right: 10px;
        font-size: 14px;
      }
    }
  }

  .main {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
}
</style>
