<script setup>
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import { useSaleStore, useSizeStore } from '@/stores/counter'
import dayjs from 'dayjs'

const saleStore = useSaleStore()
const sizeStore = useSizeStore()

//日期选择器逻辑
const today = new Date()
const startTime = ref([
  new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
  new Date(today.getFullYear(), today.getMonth(), today.getDate())
])
const minDate = ref(new Date(today.getFullYear(), today.getMonth() - 5))
const maxDate = ref(
  new Date(today.getFullYear(), today.getMonth(), today.getDate())
)
watch(startTime, (newData) => {
  saleStore.range(
    dayjs(newData[0]).format('M.D'),
    dayjs(newData[1]).format('M.D')
  )
  echartsRender()
})

//range筛选
const selectedRange = ref('Day')
watch(selectedRange, () => {
  echartsRender()
})

//product筛选
const selectedProduct = ref('product1')
watch(selectedProduct, () => {
  echartsRender()
})

//渲染选择
const isSelected = ref(false)
const info = ref()
var userEc
const echartsRender = () => {
  var infoEl = info.value
  if (userEc) {
    echarts.dispose(userEc)
  }
  userEc = echarts.init(infoEl, 'dark')
  var option = isActive.value[2]
    ? sizeRender()
    : isSelected.value === false
      ? allSalesRender(isActive.value[0] ? 'Sales($)' : 'Orders')
      : proSalesRender(isActive.value[0] ? 'Sales($)' : 'Orders')
  userEc.setOption(option)
  window.addEventListener('resize', () => {
    userEc.resize()
  })
}
//allSales渲染配置
const allSalesRender = (name) => {
  const dateList = saleStore
    .getData(selectedRange.value, 0)
    .map(function (item) {
      return item[0]
    })
  const valueList = saleStore
    .getData(selectedRange.value, 0)
    .map(function (item) {
      return item[1]
    })
  return {
    textStyle: {
      color: '#fff',
      fontSize: 16
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br />Sales: <b>${c}<b/>'
    },
    xAxis: [
      {
        data: dateList,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        }
      }
    ],
    yAxis: [
      {
        name: name,
        nameGap: 30,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#fff'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.15)',
            type: 'dashed'
          }
        }
      }
    ],
    grid: [
      {
        top: '12%',
        left: '6%',
        width: '90%'
      }
    ],
    series: [
      {
        name: 'Line 3',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2
        },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: {
          opacity: 0.4,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#25008A'
            },
            {
              offset: 1,
              color: '#B3D5FC'
            }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: valueList
      }
    ]
  }
}

//proSales渲染配置
const proSalesRender = (name) => {
  const dateList = saleStore
    .getData(selectedRange.value, 0)
    .map(function (item) {
      return item[0]
    })
  var i = 1
  const valueList = Array.from({ length: 14 }, () =>
    saleStore.getData(selectedRange.value, i++).map(function (item) {
      return item[1]
    })
  )
  return {
    textStyle: {
      color: '#fff',
      fontSize: 16
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      selected: {
        project1: true,
        project2: true,
        project3: true,
        project4: false,
        project5: false,
        project6: false,
        project7: false,
        project8: false,
        project9: false,
        project10: false,
        project11: false,
        project12: false,
        project13: false,
        project14: false
      },
      bottom: 16,
      width: '80%',
      type: 'scroll',
      textStyle: {
        fontSize: 12
      }
    },
    grid: [
      {
        top: '12%',
        left: '6%',
        width: '90%',
        height: '76%'
      }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dateList
    },
    yAxis: {
      name: name,
      nameGap: 30,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#fff'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.15)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'project1',
        type: 'line',
        smooth: true,
        data: valueList[0]
      },
      {
        name: 'project2',
        type: 'line',
        smooth: true,
        data: valueList[1]
      },
      {
        name: 'project3',
        type: 'line',
        smooth: true,
        data: valueList[2]
      },
      {
        name: 'project4',
        type: 'line',
        smooth: true,
        data: valueList[3]
      },
      {
        name: 'project5',
        type: 'line',
        smooth: true,
        data: valueList[4]
      },
      {
        name: 'project6',
        type: 'line',
        smooth: true,
        data: valueList[5]
      },
      {
        name: 'project7',
        type: 'line',
        smooth: true,
        data: valueList[6]
      },
      {
        name: 'project8',
        type: 'line',
        smooth: true,
        data: valueList[7]
      },
      {
        name: 'project9',
        type: 'line',
        smooth: true,
        data: valueList[8]
      },
      {
        name: 'project10',
        type: 'line',
        smooth: true,
        data: valueList[9]
      },
      {
        name: 'project11',
        type: 'line',
        smooth: true,
        data: valueList[10]
      },
      {
        name: 'project12',
        type: 'line',
        smooth: true,
        data: valueList[11]
      },
      {
        name: 'project13',
        type: 'line',
        smooth: true,
        data: valueList[12]
      },
      {
        name: 'project14',
        type: 'line',
        smooth: true,
        data: valueList[13]
      }
    ]
  }
}

//size渲染配置
const sizeRender = () => {
  const valueList = sizeStore.sizeData.filter(
    (item) => item.name === selectedProduct.value
  )[0].data
  return {
    legend: {
      bottom: 20
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} sales ({d}%)'
    },
    series: [
      {
        name: selectedProduct.value,
        type: 'pie',
        radius: [50, 250],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        data: valueList,
        labelLine: {
          length: 6
        },
        label: {
          formatter: '  {b|{b}：{c} sales}  \n{hr|}\n{per|{d}%}',
          backgroundColor: '#F6F8FC',
          borderColor: '#8C8D8E',
          borderWidth: 1,
          borderRadius: 4,
          rich: {
            hr: {
              borderColor: '#8C8D8E',
              width: '100%',
              borderWidth: 1,
              height: 0
            },
            b: {
              color: '#4C5058',
              fontSize: 12,
              fontWeight: 'bold',
              lineHeight: 33
            },
            per: {
              color: '#fff',
              fontSize: 12,
              lineHeight: 33,
              align: 'center',
              backgroundColor: '#4C5058',
              padding: 6,
              borderRadius: 4
            }
          }
        }
      }
    ]
  }
}

onMounted(() => {
  saleStore.range(
    dayjs(startTime.value[0]).format('M.D'),
    dayjs(startTime.value[1]).format('M.D')
  )
  echartsRender()
})

const isActive = ref([true, false, false])
</script>

<template>
  <div class="container">
    <div class="container-option">
      <div
        :class="isActive[0] ? 'active' : 'passive'"
        @click="
          // eslint-disable-next-line prettier/prettier
          isActive = [true, false, false];
          echartsRender()
        "
      >
        Sale
      </div>
      /
      <div
        :class="isActive[1] ? 'active' : 'passive'"
        @click="
          // eslint-disable-next-line prettier/prettier
          isActive = [false, true, false];
          echartsRender()
        "
      >
        Order
      </div>
      /
      <div
        :class="isActive[2] ? 'active' : 'passive'"
        @click="
          // eslint-disable-next-line prettier/prettier
          isActive = [false, false, true];
          echartsRender()
        "
      >
        Size
      </div>
    </div>
    <div class="container-echarts">
      <div class="container-echarts-time" v-show="!isActive[2]">
        <b-field>
          <b-datepicker
            v-model="startTime"
            rounded
            placeholder="Date range"
            icon="calendar-today"
            horizontal-time-picker
            range
            :min-date="minDate"
            :max-date="maxDate"
            style="background-color: white; border-radius: 6px"
          >
          </b-datepicker
        ></b-field>
      </div>
      <div class="container-echarts-range" v-show="!isActive[2]">
        <b-field>
          <b-select
            v-model="selectedRange"
            style="background-color: white; width: 100%"
          >
            <option value="Day">Day</option>
            <option value="Week">Week</option>
            <option value="Month">Month</option>
          </b-select></b-field
        >
      </div>
      <div class="container-echarts-range" v-show="isActive[2]">
        <b-field>
          <b-select
            v-model="selectedProduct"
            style="background-color: white; width: 100%"
          >
            <option
              v-for="(item, index) in sizeStore.product"
              :key="index"
              :value="item"
            >
              {{ item }}
            </option>
          </b-select></b-field
        >
      </div>
      <div class="container-echarts-canvas" ref="info"></div>
      <div
        v-show="!isActive[2]"
        class="container-echarts-all commonStyle"
        :class="!isSelected ? 'high_light' : ''"
        @click="
          // eslint-disable-next-line prettier/prettier
          isSelected = false;
          echartsRender()
        "
      >
        All sales
      </div>
      <div
        v-show="!isActive[2]"
        class="container-echarts-pro commonStyle"
        :class="isSelected ? 'high_light' : ''"
        @click="
          // eslint-disable-next-line prettier/prettier
          isSelected = true;
          echartsRender()
        "
      >
        Projects' sales
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

.container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;

  &-option {
    position: absolute;
    width: 20%;
    top: 42px;
    left: 72px;
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    cursor: default;

    .active {
      font-weight: 600;
      color: #7957d5;
    }

    .passive {
      cursor: pointer;

      &:hover {
        color: $secondary;
      }
    }
  }

  &-echarts {
    position: relative;
    margin-top: 60px;
    width: 100%;
    height: 85%;

    &-time {
      position: absolute;
      top: 3%;
      width: 100%;
      height: 40px;
      z-index: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      ::v-deep .icon {
        color: #010721;
      }
    }

    &-range {
      position: absolute;
      top: 3%;
      right: 13%;
      width: 13%;
      height: 40px;
      z-index: 1;
      display: flex;
      justify-content: end;
    }

    &-canvas {
      position: absolute;
      left: 10%;
      width: 80%;
      height: 100%;
      border-radius: 50px;
      background-color: #010721;
      overflow: hidden;
    }

    &-all {
      top: 10%;
      height: 16%;
    }

    &-pro {
      top: 24%;
      height: 24%;
    }

    .commonStyle {
      position: absolute;
      left: 90%;
      width: 3%;
      border-radius: 0 10px 10px 0;
      background-color: $secondary;
      cursor: pointer;
      color: $light;
      writing-mode: vertical-lr;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
    }

    .high_light {
      z-index: 1;
      width: 4% !important;
      box-shadow: 0px -4px 6px rgba(#1d1d1d, 0.35);
      background-color: #100c2a;
      cursor: default;
    }
  }
}
</style>
