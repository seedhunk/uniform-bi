<!-- eslint-disable prettier/prettier -->
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import {
  getInventory,
  changeSingleThreshold,
  changeAllThreshold,
  rectifyInventory
} from '@/api/inventory.js'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()

//获取img列表
const data = ref()
const allData = ref()
const total = ref()
var idList = []
const getList = async (page, count) => {
  const res = await getInventory(userStore.profileInfo.branch_list[0].id, page, count)
  data.value = res.inventory_list
  allData.value = res.inventory_list
  total.value = res.inventory_count
  res.inventory_list.forEach((item) => {
    idList.push(item.id)
    thresholdList.value[item.id] = item.threshold
  })
}

//响应式逻辑
const tabelHeight = ref()
const changeDate = () => {
  if (document.body.clientWidth <= 1480) {
    num.value = 8
    tabelHeight.value = '62vh'
  } else {
    num.value = 12
    tabelHeight.value = '68vh'
  }
}

onMounted(() => {
  changeDate()
  getList(1, page, num.value)
})

window.addEventListener('resize', () => {
  changeDate()
  getList(1, page, num.value)
})

// 分页后再次调接口(后端分页)
var page = 1
const num = ref()
const onPageChange = (index) => {
  page = index
  getList(1, page, num.value)
}

//name筛选
const searchName = ref()
const search = () => {
  data.value = allData.value.filter((item) => {
    if (item.name) {
      return item.name.includes(searchName.value)
    } else {
      return false
    }
  })
}
const cancelSearch = () => {
  data.value = allData.value
  searchName.value = ''
}

//threshold
const thresholdList = ref({})
const changeThreshold = async (e, id) => {
  await changeSingleThreshold(userStore.profileInfo.branch_list[0].id, id, e.srcElement.value)
  getList(page, num.value)
}

const threshold = ref()
const instance = getCurrentInstance()
const isModalActive = ref(false)
const modalIndex = ref(0)
const selectedId = ref()
const changeAll = async () => {
  await changeAllThreshold(userStore.profileInfo.branch_list[0].id, idList, threshold.value)
  getList(page, num.value)
  isModalActive.value = false
}

const addArriveToStock = () => {
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to update the inventory?',
    canCancel: ['button'],
    onConfirm: async () => {
      await rectifyInventory(userStore.profileInfo.branch_list[0].id, selectedId.value, threshold.value)
      getList(page, num.value)
      isModalActive.value = false
    }
  })
}
const modalData = ref([
  {
    title: 'Set All Threshold',
    detail:
      'The low stock threshold of the selected product will be set as followed and the low stock alert will be applied if the inventory of the product is lower than the threshold.',
    input: 'The low stock threshold',
    fn: changeAll
  },
  {
    title: 'Update',
    detail:
      `The system cannot detect products that have not been sold through the app, which will cause the system inventory to be inconsistent with the actual inventory. If such a situation occurs, please correct it in a timely manner. Or you want to add inventory?`,
    input: 'Update the inventory',
    fn: addArriveToStock
  }
])
</script>

<template>
  <div class="rcMain">
    <input
      class="rcMain-input"
      placeholder="Search product"
      id="input"
      v-model="searchName"
      @keyup.enter="search()"
    />
    <b-icon icon="close-circle" @click="cancelSearch()" id="icon"></b-icon>
    <b-field class="rcMain-table">
      <b-table
        :data="data"
        :mobile-cards="false"
        :paginated="true"
        :per-page="num"
        @page-change="onPageChange"
        :total="total"
        backend-pagination
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
      >
        <button
          class="rcMain-table-set"
          @click="isModalActive = true"
          v-if="userStore.profileInfo.auth_list.includes('Inventory_edit')"
        >
          Set All Threshold
        </button>

        <b-modal v-model="isModalActive" has-modal-card :canCancel="['button']">
          <b-field class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-head-title">
                {{ modalData[modalIndex].title }}
              </p>
            </header>
            <section class="modal-card-body">
              <p class="modal-card-body-title">
                {{ modalData[modalIndex].detail }}
              </p>
              <div class="modal-card-body-input">
                <p>{{ modalData[modalIndex].input }}</p>
                <b-numberinput
                  controls-alignment="right"
                  v-model="threshold"
                ></b-numberinput>
              </div>
              <div class="modal-card-body-action">
                <b-button
                  type="is-danger"
                  @click="
                    // eslint-disable-next-line prettier/prettier
                    isModalActive = false;
                    modalIndex = 0
                  "
                  >Cancel</b-button
                >
                <b-button type="is-primary" @click="modalData[modalIndex].fn"
                  >Submit</b-button
                >
              </div>
            </section>
          </b-field>
        </b-modal>

        <b-table-column field="name" label="Product name" width="150" centered>
          <template v-slot="props">
            {{ props.row.name }}
          </template>
        </b-table-column>

        <b-table-column field="code" label="SKU" width="150" centered>
          <template v-slot="props">
            {{ props.row.code }}
          </template>
        </b-table-column>

        <b-table-column label="Variations" width="150" centered>
          <template v-slot="props">
            {{ props.row.material }} / {{ props.row.size }} /
            {{ props.row.color }}
          </template>
        </b-table-column>

        <b-table-column
          field="current"
          label="In stock quantity"
          width="150"
          centered
          sortable
        >
          <template v-slot="props">
            <span
              :class="
                props.row.current >= props.row.threshold ? 'more' : 'less'
              "
              >{{ props.row.current }}</span
            >
          </template>
        </b-table-column>

        <b-table-column label="threshold" width="150" centered>
          <template v-slot="props">
            <b-numberinput
              :controls="false"
              v-model="thresholdList[props.row.id]"
              @blur="changeThreshold($event, props.row.id)"
              size="is-small"
              :disabled="
                !userStore.profileInfo.auth_list.includes('Inventory_edit')
              "
            ></b-numberinput>
          </template>
        </b-table-column>

        <b-table-column
          field="action"
          width="200"
          centered
          v-slot="props"
          v-if="userStore.profileInfo.auth_list.includes('Inventory_edit')"
        >
          <span
            class="tag sed"
            @click="
              // eslint-disable-next-line prettier/prettier
              isModalActive = true;
              // eslint-disable-next-line prettier/prettier
              modalIndex = 1;
              selectedId = props.row.id
            "
          >
            Update
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

::v-deep .table thead > tr {
  cursor: default;
  font-size: 16px;

  & > td {
    vertical-align: middle;
  }
}

::v-deep .table tbody > tr {
  cursor: default;
  font-size: 16px;

  & > td {
    vertical-align: middle;
  }
}

.more {
  position: relative;
  &::before {
    position: absolute;
    top: 7px;
    left: -24px;
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: $sucess;
  }
}

.less {
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

.modal-card {
  border-radius: 5px;

  &-head {
    background-color: #7957d5;

    &-title {
      font-size: 24px;
      color: $light;
      font-weight: 600;
    }
  }

  &-body {
    width: 600px;
    min-height: 240px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;

    &-input {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-action {
      display: flex;
      justify-content: end;

      button {
        margin-left: 20px;
      }
    }
  }

  ::v-deep .pagination {
    flex-wrap: nowrap;
  }
}

@media (min-width: 1020px) {
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

    &-table {
      position: absolute;
      top: 72px;
      width: 90%;

      &-action {
        position: absolute;
        top: -56px;
        right: 170px;
        width: 180px;
        height: 40px;
        display: flex;
        justify-content: end;

        button {
          width: 80px;
          height: 100%;
          font-weight: 600;
          border-radius: 5px;
          color: $light;
        }

        &-add {
          background-color: #7957d5;
          margin-left: 20px;
        }

        &-del {
          border: 1px solid $danger;
          background-color: $danger;
        }
      }

      &-set {
        position: absolute;
        top: -56px;
        right: 0;
        height: 40px;
        width: 150px;
        font-weight: 600;
        border-radius: 5px;
        color: $light;
        background-color: #7957d5;
      }

      &-total {
        position: absolute;
        bottom: 0;
        font-size: 20px;
      }

      .sed {
        color: $light;
        background-color: $secondary;
        height: 30px;
        font-size: 14px;
        cursor: pointer;
      }

      ::v-deep .has-addons {
        flex-direction: column;
      }
    }
  }
}

@media (max-width: 1020px) {
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

    &-table {
      position: absolute;
      top: 72px;
      width: 90%;

      &-action {
        position: absolute;
        bottom: 0;
        width: 180px;
        height: 40px;
        display: flex;

        button {
          width: 80px;
          height: 100%;
          font-weight: 600;
          border-radius: 5px;
          color: $light;
        }

        &-add {
          background-color: #7957d5;
        }

        &-del {
          border: 1px solid $danger;
          background-color: $danger;
          margin-right: 20px;
        }
      }

      &-set {
        position: absolute;
        top: -56px;
        right: 0;
        height: 40px;
        width: 150px;
        font-weight: 600;
        border-radius: 5px;
        color: $light;
        background-color: #7957d5;
      }

      &-total {
        position: absolute;
        bottom: -6%;
        font-size: 20px;
      }

      .sed {
        color: $light;
        background-color: $secondary;
        height: 30px;
        font-size: 14px;
        cursor: pointer;
      }

      ::v-deep .has-addons {
        flex-direction: column;
      }
    }
  }
}
</style>
