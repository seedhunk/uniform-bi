<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiArrowLeftCircle } from '@mdi/js'
//icon路径
const path = mdiArrowLeftCircle
</script>

<template>
  <div class="header" mobile-burger="false">
    <div class="header-back" @click="$router.push('/')">
      <svg-icon type="mdi" :path="path" class="header-back-icon"></svg-icon>
      <p class="header-back-title">Business intelligence system</p>
    </div>
  </div>
  <router-view></router-view>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

.header {
  width: 100vw;
  height: 10vh;
  background-color: #f5f5f5;

  &-back {
    margin-left: 20px;
    width: 400px;
    height: 10vh;
    display: flex;
    justify-content: space-around;
    align-items: center;
    cursor: pointer;

    &-icon {
      width: 10%;
      height: 100%;
    }

    &-title {
      width: 90%;
      height: 100%;
      line-height: 9.5vh;
      text-align: center;
      font-size: 160%;
    }
  }

  &-back:hover {
    color: $secondary;
  }
}
</style>
