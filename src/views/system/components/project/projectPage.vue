<script setup>
import { markRaw, ref, computed, getCurrentInstance } from 'vue'
import allProject from './components/allProject.vue'
import addProject from './components/addProject.vue'
import proDetail from './components/proDetail.vue'
import addProduct from './components/addProduct.vue'

//面包屑逻辑，实现组件切换
const seBlock = [
  {
    component: addProject,
    name: 'Add Project',
    exitProtect: true
  },
  {
    component: proDetail,
    name: 'Project Detail',
    exitProtect: false
  },
  {
    component: addProduct,
    name: 'Add products to sub-project',
    exitProtect: false
  }
]

const blocks = computed(() => [
  {
    block: markRaw(allProject),
    show: true
  },
  {
    block: markRaw(seBlock[bindex.value].component),
    show: false
  }
])
const activeIndex = ref(0)
const activeBlock = computed(() => blocks.value[activeIndex.value])

//子组件如果需要提示这里会将state修改为true
var state = false
const changeTheCheck = (e) => {
  state = e
}

//子传父的数据还有进行页面切换
const bindex = ref(0)
const bmode = ref(0)
const bdata = ref()
const bsubData = ref()
const changeBlockIndex = (index, mode, data, subData) => {
  if (index === -1) {
    changeBlock(0)
  } else {
    bmode.value = mode
    bindex.value = index
    bdata.value = data
    bsubData.value = subData
    blocks.value[1].show = true
    activeIndex.value = 1
  }
}

const instance = getCurrentInstance()
const changeBlock = (mode) => {
  //该页面为提示保护且需要提示时
  if (mode === 1 && seBlock[bindex.value].exitProtect && state) {
    instance.proxy.$buefy.dialog.confirm({
      message: 'Are you sure to exit without saving?',
      canCancel: ['button'],
      onConfirm: () => {
        blocks.value[1].show = false
        activeIndex.value = 0
        state = false
      }
    })
  } else {
    blocks.value[1].show = false
    activeIndex.value = 0
    state = false
  }
}
const selectName = () => {
  if (bindex.value === 0) {
    if (bmode.value === 0) {
      return 'Add Project'
    } else if (bmode.value === 1) {
      return 'Edit ' + bdata.value.name
    } else {
      return 'Add a sub-project to ' + bdata.value.name
    }
  } else if (bindex.value === 1) {
    return bdata.value.name + ' detail'
  } else {
    return 'Add products to ' + bdata.value.name
  }
}
</script>

<template>
  <!-- 顶部引导栏 -->
  <div class="breadcrumb">
    <div class="breadcrumb-title" @click="changeBlock(1)">All Projects</div>
    <div class="breadcrumb-item" v-if="blocks[1].show">
      {{ selectName() }}
    </div>
  </div>

  <!-- 组件渲染入口 -->
  <div class="main">
    <component
      :is="activeBlock.block"
      @changeBlock="changeBlockIndex"
      @changeCheck="changeTheCheck"
      :mode="bmode"
      :data="bdata"
      :sub_Data="bsubData"
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
