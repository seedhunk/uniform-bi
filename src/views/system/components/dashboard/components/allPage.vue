<script setup>
import { ref, watch, onMounted, getCurrentInstance } from 'vue'
import { getAll, cancelOppointment } from '@/api/dashboard'
import dayjs from 'dayjs'
// 扩展插件
import minMax from 'dayjs/plugin/minMax'
dayjs.extend(minMax)
import { useRouter } from 'vue-router'

const router = useRouter()
//filter按钮动画
const isright = ref(true)
const changeTab = (e) => {
  var input = document.getElementById('input')
  var form = document.getElementById('form')
  var icon = document.getElementById('icon')
  if (isright.value === true) {
    isright.value = false
    e.target.style.animationName = 'leftmove'
    e.target.style.animationDuration = '0.8s'
    e.target.style.animationFillMode = 'forwards'

    input.style.animationName = 'gone'
    input.style.animationDuration = '0.01s'
    input.style.animationFillMode = 'forwards'

    form.style.animationName = 'form-show'
    form.style.animationDuration = '0.8s'
    form.style.animationFillMode = 'forwards'

    icon.style.display = 'none'
  } else {
    isright.value = true
    e.target.style.animationName = 'rightmove'
    e.target.style.animationDuration = '0.8s'
    e.target.style.animationFillMode = 'forwards'

    input.style.animationName = 'show'
    input.style.animationDuration = '0.8s'
    input.style.animationFillMode = 'forwards'

    form.style.animationName = 'form-gone'
    form.style.animationDuration = '0.01s'
    form.style.animationFillMode = 'forwards'

    icon.style.display = ''
  }
}

//日期选择器逻辑
const startTime = ref()
var timeSelected = false
const clearstartTime = () => {
  startTime.value = null
}
watch(startTime, (newData) => {
  if (newData) {
    timeSelected = true
  } else {
    timeSelected = false
  }
  getallAppointment()
})

//响应式
const num = ref()
const tabelHeight = ref()
const changeDate = () => {
  if (document.body.clientWidth <= 1600) {
    tabelHeight.value = '62vh'
    num.value = 9
  } else if (document.body.clientWidth <= 872) {
    num.value = 6
  } else {
    num.value = 11
    tabelHeight.value = '66vh'
  }
}

//获取所有预约
const data = ref()
const total = ref()
var offset = 0
const getallAppointment = async () => {
  const res = await getAll({
    offset,
    count: num.value,
    appointment_status: format(selectedOptions.value),
    start_day: timeSelected
      ? dayjs(startTime.value[0]).format('YYYY-MM-DD')
      : null,
    end_day: timeSelected
      ? dayjs(startTime.value[1]).format('YYYY-MM-DD')
      : null,
    user_account: searchName.value
  })

  data.value = res.appointment_list
  total.value = res.appointment_num
}

//状态码含义转换
const format = (index) => {
  if (index === 0) return 'Coming'
  if (index === 1) return 'Finished'
  if (index === -1) return 'Canceled'
  if (index === -2) return 'Absent'
  if (index === 'Coming') return 0
  if (index === 'Finished') return 1
  if (index === 'Canceled') return -1
  if (index === 'Absent') return -2
}
//状态筛选
const selectedOptions = ref()
watch(selectedOptions, () => {
  getallAppointment()
})

//name筛选
const searchName = ref()
const search = () => {
  getallAppointment()
}
const cancelSearch = () => {
  searchName.value = ''
  getallAppointment()
}

onMounted(() => {
  changeDate()
  getallAppointment()
})

window.addEventListener('resize', () => {
  changeDate()
})

//分页后再次调接口
const onPageChange = (page) => {
  offset = (page - 1) * num.value
  getallAppointment()
}

//取消预约接口
const instance = getCurrentInstance()
const cancel = (param) => {
  if (param.note === 'pickup') {
    if (param.order_id) {
      router.push({
        path: '/order',
        query: {
          id: param.order_id
        }
      })
    } else {
      alert('This order has expired')
    }
  } else {
    if (param.status === 0) {
      instance.proxy.$buefy.dialog.confirm({
        message: 'Are you sure to cancel this booking?',
        canCancel: ['button'],
        onConfirm: async () => {
          await cancelOppointment(param.id, -1, param.day, param.period)
          getallAppointment()
        }
      })
    }
  }
}

const statusClass = (index) => {
  if (index === 0) {
    return 'state'
  } else if (index === -2) {
    return 'absent'
  } else {
    return 'cancel'
  }
}
</script>

<template>
  <div class="title">All Appointment</div>
  <div class="rcMain" id="rcMain">
    <input
      class="rcMain-input"
      placeholder="Name Search"
      id="input"
      v-model="searchName"
      @keyup.enter="search()"
      autocomplete="off"
    />
    <b-icon icon="close-circle" @click="cancelSearch()" id="icon"></b-icon>

    <div class="rcMain-form" id="form">
      <b-field class="rcMain-form-select">
        <b-select placeholder="State" v-model="selectedOptions">
          <option value="None">None</option>
          <option value="Canceled">Canceled</option>
          <option value="Absent">Absent</option>
          <option value="Coming">Coming</option>
          <option value="Finished">Finished</option>
        </b-select></b-field
      >

      <b-field class="rcMain-form-time">
        <b-datepicker
          v-model="startTime"
          rounded
          placeholder="Click to select..."
          icon="calendar-today"
          :icon-right="startTime ? 'close-circle' : ''"
          icon-right-clickable
          @icon-right-click="clearstartTime"
          horizontal-time-picker
          range
        >
        </b-datepicker
      ></b-field>
    </div>

    <button class="rcMain-button" @click="changeTab($event)"></button>

    <b-field class="rcMain-table">
      <b-table
        :data="data"
        :mobile-cards="false"
        :paginated="true"
        :per-page="num"
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
        default-sort="date"
        :sort-multiple="true"
        @page-change="onPageChange"
        :total="total"
        backend-pagination
      >
        <b-table-column centered v-slot="props" width="150">
          <span
            class="tag"
            :class="props.row.note === 'pickup' ? 'ter' : 'sed'"
            :style="{ height: '30px', fontSize: '14px' }"
          >
            {{ props.row.note }}
          </span>
        </b-table-column>

        <b-table-column field="name" label="Name" width="100">
          <template v-slot="props">
            <p class="name">{{ props.row.ENGname }}</p>
          </template>
        </b-table-column>

        <b-table-column
          field="day"
          label="Booking date"
          width="200"
          sortable
          centered
        >
          <template v-slot="props">
            {{ props.row.day }}
          </template>
        </b-table-column>

        <b-table-column
          field="period"
          label="Booking timeslot"
          width="250"
          sortable
          centered
        >
          <template v-slot="props">
            {{
              props.row.period === 97
                ? '00:00 - 24:00'
                : `${Math.floor((props.row.period * 15) / 60)}:${(props.row.period * 15) % 60 === 0 ? '00' : (props.row.period * 15) % 60} - ${(((props.row.period * 15) % 60) + 15) % 60 === 0 ? Math.floor((props.row.period * 15) / 60 + 1) : Math.floor((props.row.period * 15) / 60)}:${(((props.row.period * 15) % 60) + 15) % 60 === 0 ? '0' + '0' : ((props.row.period * 15) % 60) + 15}`
            }}
          </template>
        </b-table-column>

        <b-table-column field="status" label="State" width="200">
          <template v-slot="props">
            <p :class="statusClass(props.row.status)">
              {{ format(props.row.status) }}
            </p>
          </template>
        </b-table-column>

        <b-table-column field="date" centered v-slot="props" width="200">
          <span
            class="tag"
            :class="
              props.row.note === 'pickup'
                ? 'is-primary'
                : props.row.status === 0
                  ? 'is-primary'
                  : 'disabled'
            "
            :style="{ height: '30px', fontSize: '14px' }"
            @click="cancel(props.row)"
          >
            {{ props.row.note === 'pickup' ? 'View Order' : 'Cancel Booking' }}
          </span>
        </b-table-column>

        <template #empty>
          <div class="has-text-centered">No records</div>
        </template>
      </b-table>
    </b-field>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';
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

.absent {
  position: relative;
  &::before {
    position: absolute;
    top: 7px;
    left: -24px;
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: $danger;
  }
}

.sed {
  color: $light;
  background-color: $secondary;
}

.ter {
  color: $light;
  background-color: $tertiary;
}

@media (min-width: 960px) {
  ::v-deep .table tbody > tr {
    font-size: 16px;
  }

  .title {
    height: 5%;
    font-size: 150%;
    padding: 5px 60px;
    margin: 0;
  }

  .rcMain {
    height: 95%;
    width: 100%;
    padding: 16px 60px 0;
    position: relative;

    &-input {
      position: absolute;
      width: 300px;
      height: 40px;
      border: 1px solid $primary;
      border-radius: 5px;
      text-indent: 10px;
      color: $black;

      &:focus {
        outline: 1px solid $primary;
      }
    }

    .icon {
      position: absolute;
      opacity: 0.25;
      left: 330px;
      top: 25px;
      cursor: pointer;
    }

    &-form {
      position: absolute;
      left: 120px;
      width: 0px;
      height: 40px;
      display: flex;
      overflow: hidden;

      &-select {
        height: 40px;
        margin-right: 20px;
      }

      &-time {
        width: 250px;
        height: 40px;
      }
    }

    &-button {
      position: absolute;
      left: 380px;
      width: 40px;
      height: 40px;
      border: 1px solid $primary;
      background-image: url('@/assets/images/Vector.png');
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      border-radius: 5px;
      cursor: pointer;
    }

    &-table {
      position: absolute;
      top: 72px;
      width: 90%;
    }
  }

  .disabled {
    color: $black;
    background-color: $medium;
    cursor: default;
  }

  .is-primary {
    cursor: pointer;
  }
}

@media (max-width: 960px) {
  ::v-deep .table tbody > tr {
    font-size: 18px;
  }

  .title {
    height: 5%;
    font-size: 130%;
    padding: 5px 60px;
    margin: 0;
  }

  .rcMain {
    height: 95%;
    width: 100%;
    padding: 16px 60px;
    position: relative;

    &-input {
      position: absolute;
      width: 300px;
      height: 40px;
      border: 1px solid $primary;
      border-radius: 5px;
      text-indent: 10px;
      color: $black;

      &:focus {
        outline: 1px solid $primary;
      }
    }

    .icon {
      position: absolute;
      opacity: 0.25;
      left: 330px;
      top: 25px;
      cursor: pointer;
    }

    &-form {
      position: absolute;
      left: 120px;
      width: 0px;
      height: 40px;
      display: flex;
      overflow: hidden;

      &-select {
        height: 40px;
        margin-right: 20px;
      }

      &-time {
        width: 240px;
        height: 40px;
      }
    }

    &-button {
      position: absolute;
      left: 380px;
      width: 40px;
      height: 40px;
      border: 1px solid $primary;
      background-image: url('@/assets/images/Vector.png');
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      border-radius: 5px;
      cursor: pointer;
    }

    &-table {
      position: absolute;
      top: 72px;
    }
  }

  .disabled {
    color: $black;
    background-color: $medium;
    cursor: default;
  }

  .is-primary {
    cursor: pointer;
  }
}
</style>

<style>
@keyframes leftmove {
  0% {
  }

  100% {
    left: 60px;
  }
}

@keyframes rightmove {
  0% {
    left: 60px;
  }

  100% {
    left: 380px;
  }
}

@keyframes gone {
  0% {
  }

  100% {
    width: 0;
    display: none;
  }
}

@keyframes show {
  0% {
    width: 0;
    display: none;
  }

  100% {
    width: 300px;
    display: show;
  }
}

@keyframes form-gone {
  0% {
    width: 600px;
    display: show;
    overflow: visible;
  }

  100% {
    width: 0;
    display: none;
    overflow: hidden;
  }
}

@keyframes form-show {
  0% {
  }

  100% {
    width: 600px;
    display: show;
    overflow: visible;
  }
}
</style>
