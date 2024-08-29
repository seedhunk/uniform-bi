<script setup>
import cusList from './components/chartList.vue'
</script>

<template>
  <!-- 顶部引导栏 -->
  <div class="breadcrumb">
    <div class="breadcrumb-title">Rule Management</div>
  </div>

  <!-- 组件渲染入口 -->
  <div class="main">
    <component :is="cusList"></component>
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
