<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount } from '@mdi/js'
import { onMounted, onUpdated } from 'vue'
import { useRouter } from 'vue-router'

//菜单选择高亮逻辑

//获取当前路由来知晓目前应高亮的dom
const router = useRouter()
var currentPath = router.currentRoute.value.path
onMounted(() => {
  //slice的作用是去掉路由路径前面的'/'以方便匹配
  document.getElementById(currentPath.slice(1)).classList.add('selected')
})

onUpdated(() => {
  //dom更新后先删除之前的高亮类
  document.getElementById(currentPath.slice(1)).classList.remove('selected')
  //获取新的选中dom并设置高亮
  currentPath = router.currentRoute.value.path
  document.getElementById(currentPath.slice(1)).classList.add('selected')
})

//icon路径
const path = mdiAccount
</script>

<template>
  <b-navbar class="header" centered>
    <template #brand>
      <b-navbar-item class="header-right">
        Business intelligence system
      </b-navbar-item>
    </template>
    <template #start>
      <b-navbar-item
        id="solutions"
        class="header-left"
        @click="$router.push('/solutions')"
        >Solutions</b-navbar-item
      >
      <b-navbar-item
        id="benefits"
        class="header-left"
        @click="$router.push('/benefits')"
        >Benefits
      </b-navbar-item>
      <b-navbar-item
        id="competitor"
        class="header-left"
        @click="$router.push('/competitor')"
        >Competitor</b-navbar-item
      >
      <b-navbar-item
        id="aboutus"
        class="header-left"
        @click="$router.push('/aboutus')"
        >About us</b-navbar-item
      >
    </template>
    <template #end>
      <b-navbar-item class="header-end" @click="$router.push('/loginPage')">
        <svg-icon type="mdi" :path="path" class="header-end-icon"></svg-icon>
      </b-navbar-item>
    </template>
  </b-navbar>
  <div class="text"><router-view></router-view></div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';
.header {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  height: 10vh;

  &-right {
    margin-left: 40px;
    font-weight: 600;
    font-size: 30px;
    color: $black;
    height: 10vh;
  }

  &-right:hover {
    cursor: default;
    color: $black !important;
  }

  &-left {
    font-size: 20px;
    color: $black;
    padding: 0 20px;
  }

  &-left:hover {
    background-color: $primary !important;
    color: white !important;
  }

  &-end {
    width: 72px;
    height: 10vh;

    &-icon {
      width: 72px;
      height: 36px;
    }
  }

  &-end:hover {
    background-color: $primary !important;
    color: white !important;
  }

  //样式穿透
  ::v-deep .navbar-burger {
    height: 10vh;
  }

  ::v-deep .navbar-burger:hover {
    background-color: $secondary;
    color: white;
  }

  ::v-deep .header-end {
    display: flex;
    align-items: center;
    width: 100%;
  }

  //选中样式
  .selected {
    background-color: $secondary !important;
    color: white !important;
  }
}

.text {
  width: 100vw;
  height: 90vh;
  overflow: auto;
}
</style>
