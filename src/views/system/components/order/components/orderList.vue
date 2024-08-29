<script setup>
import { ref, onMounted, watch, getCurrentInstance, inject } from 'vue'
import { getOrder, getTranferOrder } from '@/api/order'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()
//获取order列表
const data = ref()
const total = ref()
var offset = 0
const getList = async () => {
  const res = await getOrder(userStore.profileInfo.branch_list[0].id, {
    offset,
    count: 8,
    start_day: timeSelected
      ? dayjs(startTime.value[0]).format('YYYY-MM-DD')
      : null,
    end_day: timeSelected
      ? dayjs(startTime.value[1]).format('YYYY-MM-DD')
      : null,
    unique_id: searchName.value,
    status: selectedStatus.value === 'None' ? null : selectedStatus.value
  })
  data.value = res.order_list
  total.value = res.count
}

//响应式逻辑
const tabelHeight = ref()
const changeDate = () => {
  if (document.body.clientWidth <= 1600) {
    tabelHeight.value = '62vh'
  } else {
    tabelHeight.value = '70vh'
  }
}

//filter切换动画
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

    input.style.animationName = 'input-gone'
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

    input.style.animationName = 'input-show'
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
  getList()
})

//状态筛选
const selectedStatus = ref()
watch(selectedStatus, () => {
  getList()
})

//name筛选
const searchName = ref()
const search = () => {
  getList()
}
const cancelSearch = () => {
  searchName.value = ''
  getList()
}

//分页后再次调接口(后端分页)
const onPageChange = (page) => {
  offset = (page - 1) * 8
  getList()
}

const instance = getCurrentInstance()
onMounted(() => {
  changeDate()
  getList()
  if (instance.proxy.$route.query.open) openTransfer()
})

window.addEventListener('resize', () => {
  changeDate()
})

const statusSelect = (status) => {
  if (status === 'completed' || status === 'cancelled') {
    return 'medium'
  } else {
    return 'success'
  }
}
const isModalActive = ref(false)
const transferList = ref()
const openTransfer = async () => {
  const res = await getTranferOrder(userStore.profileInfo.branch_list[0].id)
  transferList.value = res
  isModalActive.value = true
}
const open = inject('open')
watch(
  open,
  (newVal) => {
    if (newVal) {
      openTransfer()
      open.value = false
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="rcMain">
    <input
      class="rcMain-input"
      placeholder="ID Search"
      id="input"
      v-model="searchName"
      @keyup.enter="search()"
      autocomplete="off"
    />
    <b-icon icon="close-circle" @click="cancelSearch()" id="icon"></b-icon>

    <div class="rcMain-form" id="form">
      <b-field class="rcMain-form-status">
        <b-select
          placeholder="Status"
          v-model="selectedStatus"
          style="border: 1px solid #d1caf2"
          ><option value="None">None</option>
          <option value="pending">Pending payment</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </b-select></b-field
      >

      <b-field class="rcMain-form-start">
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
        per-page="8"
        @page-change="onPageChange"
        :total="total"
        backend-pagination
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
      >
        <button
          class="rcMain-table-action"
          @click="openTransfer()"
          v-if="userStore.profileInfo.auth_list.includes('Order_edit')"
        >
          Order in transfer
        </button>

        <!-- transfer订单模态 -->
        <b-modal v-model="isModalActive" has-modal-card :canCancel="['button']">
          <b-field class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-title">Order in transfer</p>
              <button
                type="button"
                class="delete"
                @click="isModalActive = false"
              />
            </header>
            <section class="modal-card-body">
              <b-field>
                <b-table
                  :data="transferList"
                  :mobile-cards="false"
                  :paginated="true"
                  :per-page="6"
                  :sticky-header="true"
                  pagination-position="bottom"
                  height="50vh"
                >
                  <b-table-column width="200" centered>
                    <template v-slot="props">
                      <span
                        class="tag"
                        :class="
                          props.row.transfer_from ===
                          userStore.profileInfo.branch_list[0].id
                            ? 'danger'
                            : 'success'
                        "
                        >{{
                          props.row.transfer_from ===
                          userStore.profileInfo.branch_list[0].id
                            ? 'transferring'
                            : 'receive'
                        }}</span
                      >
                    </template>
                  </b-table-column>

                  <b-table-column
                    field="id"
                    label="Order ID"
                    width="200"
                    centered
                  >
                    <template v-slot="props">
                      {{ props.row.code }}
                    </template>
                  </b-table-column>

                  <b-table-column
                    field="created_time"
                    label="Order date"
                    width="200"
                    centered
                    sortable
                  >
                    <template v-slot="props">
                      {{
                        dayjs(props.row.created_time).format('YYYY-MM-DD HH:mm')
                      }}
                    </template>
                  </b-table-column>

                  <b-table-column
                    field="total_price"
                    label="Total amount"
                    width="200"
                    centered
                    sortable
                  >
                    <template v-slot="props">
                      ${{ props.row.total_price }}.00
                    </template>
                  </b-table-column>

                  <b-table-column field="action" width="200" centered>
                    <template v-slot="props">
                      <span
                        class="tag view"
                        @click="$emit('onChangeBlock', 1, props.row.id)"
                      >
                        View detail
                      </span>
                    </template>
                  </b-table-column>

                  <template #empty>
                    <div class="has-text-centered">No records</div>
                  </template>
                </b-table>
              </b-field>
            </section>
          </b-field>
        </b-modal>

        <b-table-column field="id" label="Order ID" width="200" centered>
          <template v-slot="props">
            <p :class="props.row.isNew ? 'dot' : ''">
              {{ props.row.code }}
            </p>
          </template>
        </b-table-column>

        <b-table-column
          field="created_time"
          label="Order date"
          width="200"
          centered
          sortable
        >
          <template v-slot="props">
            {{ dayjs(props.row.created_time).format('YYYY-MM-DD HH:mm') }}
          </template>
        </b-table-column>

        <b-table-column
          field="status"
          label="Order status"
          width="200"
          centered
        >
          <template v-slot="props">
            <span class="tag" :class="statusSelect(props.row.status)">{{
              props.row.status
            }}</span>
          </template>
        </b-table-column>

        <b-table-column
          field="total_price"
          label="Total amount"
          width="200"
          centered
          sortable
        >
          <template v-slot="props"> ${{ props.row.total_price }}.00 </template>
        </b-table-column>

        <b-table-column field="action" width="200" centered>
          <template v-slot="props">
            <span
              class="tag view"
              @click="$emit('onChangeBlock', 1, props.row.id)"
            >
              View detail
            </span>
          </template>
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

.view {
  color: $light;
  background-color: $secondary;
  cursor: pointer;
}

.danger {
  color: $light;
  background-color: $danger;
}

.medium {
  color: $light;
  background-color: $medium;
}

.success {
  color: $light;
  background-color: $sucess;
}

::v-deep .table thead > tr {
  font-size: 16px;

  & > td {
    vertical-align: middle;
  }
}

::v-deep .table tbody > tr {
  font-size: 16px;

  & > td {
    vertical-align: middle;
  }
}

.rcMain {
  height: 100%;
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

    &-time {
      width: 250px;
      height: 40px;
    }

    &-status {
      height: 40px;
      margin-right: 20px;
    }
  }

  &-button {
    position: absolute;
    left: 380px;
    width: 40px;
    height: 40px;
    background-image: url('@/assets/images/Vector.png');
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    border-radius: 5px;
  }

  &-table {
    position: absolute;
    top: 72px;
    width: 90%;

    &-action {
      position: absolute;
      right: 0;
      top: -56px;
      height: 40px;
      width: 140px;
      font-weight: 600;
      border-radius: 6px;
      color: $light;
      border: 1px solid $secondary;
      background-color: $secondary;
    }

    span {
      height: 30px;
      font-size: 14px;
    }
  }

  .dot {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 32%;
      width: 10px;
      height: 10px;
      background-color: $danger;
      border-radius: 50%;
    }
  }
}

.modal-card {
  border-radius: 5px;

  &-head {
    background-color: #7957d5;
  }

  &-title {
    font-size: 24px;
    color: $light;
    font-weight: 600;
    margin-right: 100px;
  }

  ::v-deep .pagination {
    flex-wrap: nowrap;
  }

  ::v-deep .has-addons {
    flex-direction: column;
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

@keyframes input-gone {
  0% {
  }

  100% {
    width: 0;
    display: none;
  }
}

@keyframes input-show {
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
    width: 450px;
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
    width: 450px;
    display: show;
    overflow: visible;
  }
}
</style>
