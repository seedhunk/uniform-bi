<script setup>
import { markRaw, ref, computed } from 'vue'
import role from './components/roleList.vue'
import staff from './components/staList.vue'
import branch from './components/branchList.vue'

//面包屑逻辑，实现组件切换
const seBlock = [
  {
    component: role,
    name: 'Role management'
  },
  {
    component: staff,
    name: 'Staff management'
  }
]

const blocks = computed(() => [
  {
    block: markRaw(branch),
    show: true
  },
  {
    block: markRaw(seBlock[bindex.value].component),
    show: false
  }
])
const activeIndex = ref(0)
const activeBlock = computed(() => blocks.value[activeIndex.value])

//子传父的数据还有进行页面切换
const bindex = ref(0)
const bid = ref()
const changeBlockIndex = (index, id) => {
  if (index === -1) {
    blocks.value[1].show = false
    activeIndex.value = 0
  } else {
    bindex.value = index
    bid.value = id
    blocks.value[1].show = true
    activeIndex.value = 1
  }
}
</script>

<template>
  <!-- 顶部引导栏 -->
  <div class="breadcrumb">
    <div class="breadcrumb-title" @click="changeBlockIndex(-1)">
      Account management
    </div>
    <div class="breadcrumb-item" v-if="blocks[1].show">
      {{ seBlock[bindex].name }}
    </div>
  </div>

  <!-- 组件渲染入口 -->
  <div class="main">
    <component
      :is="activeBlock.block"
      @changeBlock="changeBlockIndex"
      :id="bid"
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
