<script setup>
import { onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { getRecent } from '@/api/dashboard'

const date = ref(new Date())
const data = ref([])
const report = ref([
  {
    title: 'Appointment customers',
    num: '12',
    detail: '39%of this week'
  },
  {
    title: 'Weekly sales',
    num: '$6490',
    detail: '39%of this month'
  },
  {
    title: 'Weekly order',
    num: '79',
    detail: '39%of this month'
  },
  {
    title: 'Weekly inventory',
    num: '12',
    detail: '39%of this month'
  }
])

// 响应式逻辑
const inline = ref()
const dateWith = ref()
const tabelHeight = ref()
const size = ref()
const num = ref()
const cbWidth = ref()
const changeDate = () => {
  if (document.body.clientWidth <= 1320) {
    size.value = ''
    num.value = 6
  } else {
    size.value = 'is-medium'
    num.value = 9
  }

  if (document.body.clientWidth > 1120) {
    tabelHeight.value = '430px'
    inline.value = true
    dateWith.value = 'auto'
    cbWidth.value = '120px'
  } else if (document.body.clientWidth <= 872) {
    size.value = 'is-small'
    cbWidth.value = '100px'
    if (document.body.clientHeight > 1280) {
      inline.value = true
      dateWith.value = 'auto'
      tabelHeight.value = '320px'
      num.value = 5
    } else {
      inline.value = false
      dateWith.value = '90%'
      tabelHeight.value = '360px'
      num.value = 5
    }
  } else {
    if (document.body.clientHeight > 1280) {
      inline.value = true
      dateWith.value = 'auto'
    } else {
      inline.value = false
      dateWith.value = '90%'
    }

    tabelHeight.value = '350px'
    num.value = 6
    cbWidth.value = '100px'
  }
}

const getrecentOppointment = async (item) => {
  const res = await getRecent(dayjs(item).format('YYYY-MM-DD'))
  data.value = res.appointment_list
}

onMounted(() => {
  changeDate()
  getrecentOppointment(date.value)
})

window.addEventListener('resize', () => {
  changeDate()
})

watch(date, async (newValue) => {
  getrecentOppointment(newValue)
})

const format = (index) => {
  if (index === 0) return 'Coming'
  if (index === 1) return 'Finished'
  if (index === -1) return 'Canceled'
  if (index === -2) return 'Absent'
}
</script>

<template>
  <div class="title">Recent appointment</div>
  <div class="rcMain">
    <b-field :style="{ width: dateWith }">
      <b-datepicker
        v-model="date"
        :inline="inline"
        icon="calendar-today"
        :size="size"
      >
      </b-datepicker
    ></b-field>

    <b-table
      :data="data"
      :mobile-cards="false"
      :paginated="true"
      :per-page="num"
      :height="tabelHeight"
      :sticky-header="true"
      :narrowed="true"
      pagination-position="top"
    >
      <b-table-column field="day" label="Date" width="200">
        <template v-slot="props">
          {{ props.row.day }}
        </template>
      </b-table-column>

      <b-table-column field="name" label="Name" width="240">
        <template v-slot="props">
          {{ props.row.ENGname }}
        </template>
      </b-table-column>

      <b-table-column field="status" label="State" width="150">
        <template v-slot="props">
          <p :class="props.row.status === 0 ? 'state' : 'cancel'">
            {{ format(props.row.status) }}
          </p>
        </template>
      </b-table-column>

      <b-table-column field="date" centered v-slot="props">
        <span
          class="tag"
          :class="props.row.status === 0 ? 'is-primary' : 'disabled'"
          :style="{ height: '30px', width: cbWidth, fontSize: '14px' }"
        >
          Cancel Booking
        </span>
      </b-table-column>

      <template #empty>
        <div class="has-text-centered">No records</div>
      </template>
    </b-table>
  </div>
  <div class="title">Report</div>
  <div class="container">
    <div class="container-box" v-for="(item, index) in report" :key="index">
      <div class="container-box-title">{{ item.title }}</div>
      <div class="container-box-num">{{ item.num }}</div>
      <div class="container-box-detail">{{ item.detail }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

@media (min-width: 1120px) {
  .title {
    height: 40px;
    font-size: 150%;
    padding: 5px 60px;
    margin: 0;
  }

  .state {
    position: relative;
    &::before {
      position: absolute;
      top: 7px;
      left: -24px;
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #679610;
    }
  }

  .cancel {
    position: relative;
    &::before {
      position: absolute;
      top: 7px;
      left: -24px;
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #a1a1a1;
    }
  }

  .rcMain {
    height: 60%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 0 60px;
  }

  .disabled {
    color: $black;
    background-color: $medium;
    cursor: default;
  }

  .is-primary {
    cursor: pointer;
  }

  .container {
    height: 5px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    overflow: hidden;

    &-box {
      width: 20%;
      height: 80%;
      padding: 20px;
      background-color: aliceblue;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &-title {
        width: 100%;
        font-size: 18px;
        font-weight: 600;
        color: #000;
        text-align: center;
      }

      &-num {
        width: 100%;
        font-size: 32px;
        font-weight: 600;
        color: #000;
        text-align: center;
      }

      &-detail {
        width: 100%;
        text-align: center;
        font-size: 18px;
      }
    }
  }
}

@media (max-width: 1120px) {
  .title {
    height: 5%;
    font-size: 130%;
    padding: 5px 60px;
    margin: 0;
  }

  .state {
    position: relative;
    &::before {
      position: absolute;
      top: 7px;
      left: -16px;
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #679610;
    }
  }

  .cancel {
    position: relative;
    &::before {
      position: absolute;
      top: 7px;
      left: -16px;
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #a1a1a1;
    }
  }

  .rcMain {
    height: 68%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    padding: 0 40px;
  }

  .disabled {
    color: $black;
    background-color: $medium;
    cursor: default;
  }

  .is-primary {
    cursor: pointer;
  }

  .container {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    overflow: hidden;

    &-box {
      width: 20%;
      height: 100%;
      padding: 0 20px;
      background-color: aliceblue;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &-title {
        width: 100%;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        color: #000;
      }

      &-num {
        width: 100%;
        font-size: 24px;
        font-weight: 600;
        color: #000;
        text-align: center;
      }

      &-detail {
        width: 100%;
        text-align: center;
        font-size: 16px;
      }
    }
  }
}
</style>
