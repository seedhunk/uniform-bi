<script setup>
import { defineProps, ref, onBeforeMount, getCurrentInstance, watch } from 'vue'
import {
  getOrderDetail,
  updateOrder,
  transferOrder,
  transferDoneOrder,
  notNew
} from '@/api/order'
import { getBranch } from '@/api/branch.js'
import { useUserStore } from '@/stores/counter'
import dayjs from 'dayjs'

//获取用户数据
const userStore = useUserStore()

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  id: {
    type: Number
  }
})

const form = ref({})
const status = ref('')
watch(status, (newVal) => {
  if (newVal !== form.value.status && newVal !== 'transferring')
    emit('onChangeTheCheck', true)
})
const totalPrice = ref(0)
const getDetail = async () => {
  const res = await getOrderDetail(props.id)
  form.value = res
  form.value.product_list.forEach((item) => {
    item.total = item.price * item.num
    totalPrice.value += item.total
  })
  status.value = form.value.transfer_from ? 'transferring' : form.value.status
  date.value = form.value.pickup_time
  buttonIndex.value =
    form.value.transfer_from !== null
      ? form.value.transfer_from === userStore.profileInfo.branch_list[0].id
        ? 1
        : 2
      : 0
}

const hasCheck = async () => {
  await notNew(props.id)
}

onBeforeMount(() => {
  getDetail()
  hasCheck()
})

const emit = defineEmits(['onChangeBlock'])
const instance = getCurrentInstance()

//upte操作
const updateStatus = () => {
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to update?',
    canCancel: ['button'],
    onConfirm: async () => {
      await updateOrder(
        props.id,
        status.value !== 'transferring' ? status.value : form.value.status,
        form.value.status,
        date.value,
        form.value.pickup_time,
        commentList
      )
      emit('onChangeBlock', 0, -1, true)
    }
  })
}

//transfer操作
// --transfer模态
const isModalActive1 = ref(false)
const transferred_branch = ref()
const branch_list = ref()
const transfer = () => {
  instance.proxy.$buefy.dialog.confirm({
    message:
      'Before transferring the order, please ensure that you have reached an agreement with the receiving branch.',
    canCancel: ['button'],
    onConfirm: async () => {
      // 获取branch列表
      const res = await getBranch()
      branch_list.value = res.branch_list
      isModalActive1.value = true
    }
  })
}

const goTransfer = async () => {
  await transferOrder(
    props.id,
    userStore.profileInfo.branch_list[0].name,
    transferred_branch.value.name,
    form.value.appoint_branch,
    transferred_branch.value.id
  )
  isModalActive1.value = false
  getDetail()
}

//取消或完成transfer操作
const transferDone = (type) => {
  instance.proxy.$buefy.dialog.confirm({
    message:
      type === 1
        ? 'Are you sure to cancel?'
        : 'Are you sure you want to accept the order?',
    canCancel: ['button'],
    onConfirm: async () => {
      await transferDoneOrder(
        props.id,
        type,
        userStore.profileInfo.branch_list[0].id
      )
      getDetail()
    }
  })
}
//button的三种状态

var buttonOption = ref([
  {
    name: 'Transfer',
    class: 'rcMain-transfer',
    event: transfer
  },
  {
    name: 'Cancel transfer',
    class: 'rcMain-cancel_transfer',
    event: transferDone
  },
  {
    name: 'Accept',
    class: 'rcMain-accept',
    event: transferDone
  }
])
const buttonIndex = ref(0)

//聊天框内容添加
const comment = ref('')
var commentList = []
const addComment = () => {
  if (comment.value !== '') {
    form.value.history_list.push({
      created_time: dayjs().format('YYYY-MM-DD HH:mm'),
      detail: comment.value,
      user_nickname: userStore.profileInfo.staff_name
    })

    commentList.push({
      created_time: dayjs().format('YYYY-MM-DD HH:mm'),
      detail: comment.value
    })
    comment.value = ''
    emit('onChangeTheCheck', true)
  }
}

//pick时间更改
const isModalActive = ref(false)
const today = new Date()
const date = ref()
const selectedDate = ref()
const minDate = ref(
  new Date(today.getFullYear(), today.getMonth(), today.getDate())
)
const maxDate = ref(
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
)
const changeTime = () => {
  isModalActive.value = false
  instance.proxy.$buefy.dialog.confirm({
    message:
      'Before changing the pickup time, please ensure that you have reached an agreement with the customer.',
    canCancel: ['button'],
    onConfirm: () => {
      isModalActive.value = true
    }
  })
}
</script>

<template>
  <div class="rcMain">
    <button
      class="rcMain-update"
      @click="updateStatus()"
      v-if="userStore.profileInfo.auth_list.includes('Order_edit')"
    >
      Update
    </button>
    <button
      :class="buttonOption[buttonIndex].class"
      @click="buttonOption[buttonIndex].event(buttonIndex)"
      v-if="userStore.profileInfo.auth_list.includes('Order_edit')"
    >
      {{ buttonOption[buttonIndex].name }}
    </button>
    <!-- transfer模态 -->
    <b-modal v-model="isModalActive1" has-modal-card :canCancel="['button']">
      <b-field class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Transfer</p>
          <button
            type="button"
            class="delete"
            @click="isModalActive1 = false"
          />
        </header>
        <section
          class="modal-card-body"
          style="padding-bottom: 0; height: auto"
        >
          <b-field>
            <div class="modal-card-body-line">
              <p>Branch</p>
              <b-field type="is-primary">
                <b-select v-model="transferred_branch">
                  <option
                    v-for="(item, index) in branch_list"
                    :key="index"
                    :value="item"
                    v-show="item.id !== 1 || item.id !== form.appoint_branch"
                  >
                    {{ item.name }}
                  </option>
                </b-select>
              </b-field>
            </div>

            <div class="modal-card-body-line" style="justify-content: end">
              <b-button
                type="is-danger"
                @click="isModalActive1 = false"
                style="margin-right: 24px"
                >Cancel</b-button
              >
              <b-button type="is-primary" @click="goTransfer()"
                >Transfer</b-button
              >
            </div>
          </b-field>
        </section>
      </b-field>
    </b-modal>
    <div class="rcMain-time">
      <b>Date added:</b>
      {{ dayjs(form.created_time).format('YYYY-MM-DD HH:mm') }}
      <b>Date updated:</b>
      {{ dayjs(form.modified_time).format('YYYY-MM-DD HH:mm') }}
    </div>
    <div class="rcMain-left">
      <div class="rcMain-left-title">
        <p>Order detail</p>
        <!-- <button class="rcMain-left-title-add">Send invoice</button> -->
      </div>
      <div class="rcMain-left-line"></div>
      <div class="rcMain-left-detail">
        <div class="rcMain-left-detail-input">
          <p>Order status</p>
          <b-field>
            <b-select
              v-model="status"
              :disabled="
                (!(form.status === 'processing') &&
                  !(form.status === 'pending')) ||
                form.transfer_from ||
                !userStore.profileInfo.auth_list.includes('Order_edit')
              "
            >
              <option value="transferring" disabled hidden>transferring</option>
              <option value="pending">Pending payment</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </b-select>
          </b-field>
        </div>
        <div class="rcMain-left-detail-detail">
          <p>Pickup time</p>
          <p style="display: flex; justify-content: space-between">
            {{ date }}
            <b
              style="
                text-decoration: underline;
                color: #ea6e5d;
                cursor: pointer;
              "
              @click="changeTime()"
              v-show="
                !form.transfer_from &&
                userStore.profileInfo.auth_list.includes('Order_edit') &&
                form.status !== 'completed' &&
                form.status !== 'cancelled'
              "
              >change</b
            >
          </p>

          <!-- 模态 -->
          <b-modal
            v-model="isModalActive"
            has-modal-card
            :canCancel="['button']"
          >
            <b-field>
              <b-datepicker
                v-model="selectedDate"
                inline
                :min-date="minDate"
                :max-date="maxDate"
              >
                <b-button type="is-danger" @click="isModalActive = false"
                  >Cancel</b-button
                >
                <b-button
                  type="is-primary"
                  @click="
                    // eslint-disable-next-line prettier/prettier
                    isModalActive = false;
                    date = dayjs(selectedDate).format('YYYY-MM-DD')
                    emit('onChangeTheCheck', true)
                  "
                  v-show="date"
                  style="margin-left: 24px"
                  >Change</b-button
                >
              </b-datepicker>
            </b-field>
          </b-modal>
        </div>
        <div class="rcMain-left-detail-detail">
          <p>Order ID</p>
          <p>{{ form.id }}</p>
        </div>
        <div class="rcMain-left-detail-detail">
          <p>Customer name</p>
          <p>{{ form.name }}</p>
        </div>
        <div class="rcMain-left-detail-detail">
          <p>Email</p>
          <p>{{ form.email }}</p>
        </div>
        <div class="rcMain-left-detail-detail">
          <p>Contact no.</p>
          <p>{{ form.phone }}</p>
        </div>
        <div class="rcMain-left-detail-detail">
          <p>Payment method</p>
          <p>{{ form.payment_method }}</p>
        </div>
        <div class="rcMain-left-detail-detail">
          <p>Order by</p>
          <p>{{ form.origin }}</p>
        </div>

        <b-field style="margin: 20px 0">
          <b-table :data="form.product_list" narrowed :mobile-cards="false">
            <b-table-column
              label="Product(s)"
              width="200"
              centered
              v-slot="props"
            >
              {{ props.row.detail.name }}({{ props.row.detail.material }}/{{
                props.row.detail.size
              }}/{{ props.row.detail.color }})
            </b-table-column>

            <b-table-column label="Price" width="100" centered v-slot="props">
              ${{ props.row.price }}
            </b-table-column>

            <b-table-column
              label="Quantity"
              width="100"
              centered
              v-slot="props"
            >
              {{ props.row.num }}
            </b-table-column>

            <b-table-column label="Total" width="100" centered v-slot="props">
              ${{ props.row.total }}
            </b-table-column>
          </b-table>
        </b-field>

        <div class="rcMain-left-detail-total">
          <p>Total amount</p>
          <p>${{ totalPrice }}</p>
        </div>
      </div>
    </div>
    <div class="rcMain-right">
      <div class="rcMain-right-title">
        <p>Order history</p>
      </div>
      <div class="rcMain-right-line"></div>
      <div class="rcMain-right-history">
        <div v-for="(item, index) in form.history_list" :key="index">
          <div>
            <p>{{ item.detail }}</p>
            <span
              :class="item.summary === 'status' ? 'tag system' : 'tag comment'"
            >
              {{ item.summary === 'status' ? 'system' : 'comment' }}
            </span>
          </div>
          <div>
            <p>{{ dayjs(item.created_time).format('YYYY-MM-DD HH:mm') }}</p>
            <p>{{ item.user_nickname }}</p>
          </div>
        </div>
      </div>

      <div
        class="rcMain-right-input"
        v-if="userStore.profileInfo.auth_list.includes('Order_edit')"
      >
        <b-input
          placeholder="Staff comments"
          v-model="comment"
          @keyup.enter="addComment()"
        ></b-input>
        <button @click="addComment()">Send</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';
::v-deep .input::-webkit-input-placeholder {
  color: $black;
  opacity: 0.5;
}

::v-deep .table thead > tr {
  background-color: $secondary;
  font-size: 16px;

  & > th {
    color: $light;
    vertical-align: middle;
  }
}

::v-deep .table tbody > tr {
  background-color: rgba($color: $secondary, $alpha: 0.15);
  font-size: 16px;

  & > td {
    vertical-align: middle;
  }
}

.rcMain {
  height: 100%;
  width: 100%;
  padding: 56px 60px 0;
  position: relative;
  display: flex;
  justify-content: center;

  &-update {
    position: absolute;
    top: 0;
    right: 60px;
    width: 80px;
    height: 40px;
    color: $light;
    font-weight: 600;
    border-radius: 5px;
    background-color: #7957d5;
  }

  &-transfer {
    position: absolute;
    top: 0;
    right: 160px;
    width: 80px;
    height: 40px;
    color: $light;
    font-weight: 600;
    border-radius: 5px;
    background-color: $danger;
  }

  &-cancel_transfer {
    position: absolute;
    top: 0;
    right: 160px;
    width: 130px;
    height: 40px;
    color: $light;
    font-weight: 600;
    border-radius: 5px;
    background-color: $danger;
  }

  &-accept {
    position: absolute;
    top: 0;
    right: 160px;
    width: 80px;
    height: 40px;
    color: $light;
    font-weight: 600;
    border-radius: 5px;
    background-color: $secondary;
  }

  &-time {
    position: absolute;
    top: 0;
    left: 60px;
    color: $medium;
  }

  &-left {
    box-shadow: 2px 10px 15px rgba(0, 0, 0, 0.25);
    height: 78vh;
    width: 68%;
    margin-right: 4%;
    background-color: $light;
    overflow-y: auto;

    &-title {
      padding: 2% 6%;
      height: 60px;
      width: 100%;
      font-size: 20px;
      font-weight: 600;
      color: $black;
      display: flex;
      justify-content: space-between;

      &-add {
        height: 36px;
        color: $black;
        border: 0;
        font-size: 14px;
        border-radius: 5px;
        background-color: $warning;
      }
    }

    &-line {
      height: 1px;
      width: 100%;
      background-color: #d9d9d9;
    }

    &-detail {
      padding: 4% 6%;
      width: 100%;
      height: auto;
      font-size: 18px;
      display: flex;
      flex-direction: column;

      &-input {
        width: 100%;
        height: 80px;
        display: flex;
        justify-content: space-between;

        .field {
          width: 50%;

          ::v-deep .select {
            width: 100%;

            select {
              width: 100%;
            }
          }
        }
      }

      &-detail {
        width: 100%;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;

        p:nth-child(2) {
          width: 50%;
        }
      }

      &-total {
        width: 100%;
        font-weight: 600;
        color: $secondary;
        margin-bottom: 12px;
        display: flex;
        justify-content: flex-end;

        p:nth-child(2) {
          font-weight: 500;
          color: $black;
          margin-left: 20px;
        }
      }
    }
  }

  &-right {
    display: flex;
    flex-direction: column;
    box-shadow: 2px 10px 15px rgba(0, 0, 0, 0.25);
    height: 78vh;
    width: 30%;
    background-color: $light;

    &-title {
      padding: 0 6%;
      height: 60px;
      width: 100%;
      display: flex;
      justify-content: space-between;

      p:nth-child(1) {
        font-size: 20px;
        font-weight: 600;
        line-height: 56px;
        color: $black;
      }

      p:nth-child(2) {
        font-size: 16px;
        line-height: 60px;
        text-decoration: underline;
        color: #7957d5;
        cursor: pointer;
      }
    }

    &-line {
      height: 1px;
      width: 100%;
      background-color: #d9d9d9;
    }

    &-history {
      width: 100%;
      flex: 1;
      overflow: auto;
      padding: 10px 6%;

      div {
        margin-bottom: 10px;

        div:nth-child(1) {
          display: flex;
          justify-content: space-between;
          .system {
            color: $light;
            background-color: $secondary;
          }

          .comment {
            color: $light;
            background-color: $sucess;
          }

          p {
            font-size: 16px;
            color: $black;
          }
        }

        div:nth-child(2) {
          display: flex;
          justify-content: space-between;

          p {
            font-size: 14px;
            color: $grey;
          }
        }
      }
    }

    &-input {
      width: 100%;
      padding: 10px 6%;
      display: flex;
      justify-content: space-between;

      button {
        width: 60px;
        color: $light;
        border-radius: 5px;
        background-color: #7957d5;
      }
    }
  }
}

::v-deep .datepicker-footer {
  display: flex;
  justify-content: end;
}

::v-deep .datepicker-header {
  display: none;
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

  ::v-deep .has-addons {
    flex-direction: column;
  }

  &-body {
    &-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      p {
        width: 180px;
        font-weight: 600;
        margin-right: 24px;
      }

      .field {
        flex: 1;
      }
    }
  }
}
</style>
