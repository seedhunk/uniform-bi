<script setup>
import { markRaw, ref, computed } from 'vue'
import proList from './components/productList.vue'
import addPro from './components/addProduct.vue'

const blocks = ref([
  {
    block: markRaw(proList),
    show: true
  },
  {
    block: markRaw(addPro),
    show: false
  }
])
const activeIndex = ref(0)
const activeBlock = computed(() => blocks.value[activeIndex.value])
const name = ref()
const bmode = ref()
const bdata = ref()
const changeBlock = (idx, mode, data) => {
  if (idx === 0) {
    blocks.value[1].show = false
  } else {
    bmode.value = mode
    bdata.value = data
    if (mode === 0) {
      name.value = 'Add new product'
    } else {
      name.value = data.name
    }
    blocks.value[1].show = true
  }
  activeIndex.value = idx
}
</script>

<template>
  <!-- 顶部引导栏 -->
  <div class="breadcrumb">
    <div class="breadcrumb-title" @click="changeBlock(0)">Product</div>
    <div class="breadcrumb-item" v-if="blocks[1].show">{{ name }}</div>
  </div>

  <!-- 组件渲染入口 -->
  <div class="main">
    <component
      :is="activeBlock.block"
      @changeBlock="changeBlock"
      :data="bdata"
      :mode="bmode"
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
