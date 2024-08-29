<script setup>
import { markRaw, ref, computed } from 'vue'
import allPage from './components/allPage.vue'
import recentPage from './components/recentPage.vue'

const blocks = ref([
  {
    block: markRaw(recentPage),
    show: true
  },
  {
    block: markRaw(allPage),
    show: false
  }
])
const activeIndex = ref(0)
const isShow = ref(true)
const activeBlock = computed(() => blocks.value[activeIndex.value])
const changeBlock = (idx) => {
  if (idx === 0) {
    blocks.value[1].show = false
    isShow.value = true
  } else {
    blocks.value[1].show = true
    isShow.value = false
  }
  activeIndex.value = idx
}
</script>

<template>
  <!-- 顶部引导栏 -->
  <div class="breadcrumb">
    <div class="breadcrumb-title" @click="changeBlock(0)">
      Recent Appointment
    </div>
    <div class="breadcrumb-item" v-if="blocks[1].show">All Appointment</div>
    <p class="breadcrumb-enter" @click="changeBlock(1)" v-if="isShow">
      See all appointment
    </p>
  </div>

  <!-- 组件渲染入口 -->
  <div class="main">
    <component :is="activeBlock.block"></component>
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

    &-enter {
      margin: 0 30px 0 auto;
      color: #ea6e5d;
      text-decoration: underline;
      cursor: pointer;
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

    &-enter {
      margin: 0 30px 0 auto;
      color: #ea6e5d;
      text-decoration: underline;
      cursor: pointer;
      font-size: 14px;
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
