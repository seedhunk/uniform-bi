<script setup>
import { ref, onMounted, defineProps, getCurrentInstance } from 'vue'
import { getRole, addRole, delRole } from '@/api/role.js'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  id: {
    type: Number
  }
})

//获取role列表
const data = ref()
const total = ref()
const getList = async () => {
  const res = await getRole(props.id, offset, num.value, searchName.value)
  data.value = res.role_list
  data.value.forEach((item) => {
    item.auth_list = item.auth_list.slice(2, -2).split('","')
  })
  total.value = res.role_count
  console.log(data.value)
}

//获取Authority
const branch_1 = ref([
  'Project_view',
  'Project_edit',
  'Project_delete',
  'Product_view',
  'Product_edit',
  'Product_delete',
  'Inventory_view',
  'Inventory_edit',
  'Order_view',
  'Rule_view',
  'Customer_view',
  'Account_view',
  'Account_edit',
  'Account_delete'
])
const branch_2 = ref([
  'Product_view',
  'Inventory_view',
  'Inventory_edit',
  'Order_view',
  'Order_edit',
  'Customer_view'
])

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
  getList()
})

window.addEventListener('resize', () => {
  changeDate()
  getList()
})

// 分页后再次调接口(后端分页)
var offset = 0
const num = ref()
const onPageChange = (page) => {
  offset = (page - 1) * num.value
  getList()
}

//name筛选
const searchName = ref()
const search = () => {
  getList()
}
const cancelSearch = () => {
  searchName.value = ''
  getList()
}

const isModalActive = ref(false)
const selectData = ref({})
const selectName = ref({})
const mode = ref()
const showEdit = (data, index) => {
  isModalActive.value = true
  selectData.value = JSON.parse(JSON.stringify(data))
  selectName.value = data.name
  mode.value = index
}
const showAdd = (index) => {
  isModalActive.value = true
  selectData.value = {}
  mode.value = index
}
const instance = getCurrentInstance()
const submit = async () => {
  if (!selectData.value.name || !selectData.value.auth_list) {
    instance.proxy.$buefy.toast.open({
      message: 'Please finish the form before submission',
      type: 'is-danger'
    })
  } else {
    await addRole(
      props.id,
      selectData.value.name,
      selectData.value.auth_list,
      selectData.value.id ? selectData.value.id : -1
    )
    isModalActive.value = false
    instance.proxy.$buefy.toast.open({
      message: selectData.value.id ? 'Edit success!' : 'Add success!',
      type: 'is-success'
    })
    getList()
  }
}
const delsubmit = (id) => {
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to delete?',
    canCancel: ['button'],
    onConfirm: async () => {
      await delRole(id)
      isModalActive.value = false
      instance.proxy.$buefy.toast.open({
        message: 'Delete success!',
        type: 'is-success'
      })
      getList()
    }
  })
}
</script>

<template>
  <div class="rcMain">
    <input
      class="rcMain-input"
      placeholder="Name Search"
      id="input"
      v-model="searchName"
      @keyup.enter="search()"
      autocomplete="off"
    />
    <b-icon icon="close-circle" @click="cancelSearch()" id="icon"></b-icon>
    <b-field class="rcMain-table">
      <b-table
        :data="data"
        :mobile-cards="false"
        :paginated="true"
        :per-page="num"
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
        @page-change="onPageChange"
        :total="total"
        backend-pagination
      >
        <div class="rcMain-table-action">
          <button
            class="rcMain-table-action-add"
            @click="showAdd(2)"
            v-if="userStore.profileInfo.auth_list.includes('Account_edit')"
          >
            ADD
          </button>
        </div>

        <b-table-column field="name" label="Role name" width="100" centered>
          <template v-slot="props">
            {{ props.row.name }}
          </template>
        </b-table-column>

        <b-table-column field="auth" label="Role authority" width="300">
          <template v-slot="props">
            <b-taglist>
              <b-tag
                type="is-primary"
                v-for="(item, index) in props.row.auth_list"
                :key="index"
                >{{ item }}</b-tag
              >
            </b-taglist>
          </template>
        </b-table-column>

        <b-table-column
          width="100"
          centered
          v-slot="props"
          v-if="userStore.profileInfo.auth_list.includes('Account_edit')"
        >
          <span class="tag sed" @click="showEdit(props.row, 1)"> Edit </span>
        </b-table-column>

        <template #empty>
          <div class="has-text-centered">No records</div>
        </template>
      </b-table>
      <b-modal v-model="isModalActive" has-modal-card :canCancel="['button']">
        <b-field class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">
              {{ mode === 1 ? selectName + ' / Edit' : 'Add' }}
            </p>
            <b-tooltip
              class="modal-card-del"
              label="The role has associated employees, unable to delete"
              position="is-left"
              type="is-light"
              :active="selectData.staffs === 0 ? false : true"
              multilined
              v-if="
                userStore.profileInfo.auth_list.includes('Account_delete') &&
                mode === 1
              "
            >
              <b-icon
                icon="delete-outline"
                class="del"
                @click="delsubmit(selectData.id)"
                v-if="!selectData.staffs"
              ></b-icon>

              <b-icon icon="delete-off-outline" class="del" v-else></b-icon>
            </b-tooltip>
          </header>
          <section class="modal-card-body">
            <div class="modal-card-body-input">
              <p>Role name</p>
              <b-field>
                <b-input
                  v-model="selectData.name"
                  placeholder="Enter the Role name"
                ></b-input>
              </b-field>
            </div>
            <div class="modal-card-body-input">
              <p>Authority</p>
              <b-field>
                <b-taginput
                  v-model="selectData.auth_list"
                  :data="id === 1 ? branch_1 : branch_2"
                  autocomplete
                  :open-on-focus="true"
                  field="name"
                  icon="label"
                  type="is-primary"
                  placeholder="Add a tag"
                  :readonly="true"
                >
                </b-taginput>
              </b-field>
            </div>
            <div class="modal-card-body-action">
              <b-button type="is-danger" @click="isModalActive = false"
                >Cancel</b-button
              >
              <b-button type="is-primary" @click="submit()">Submit</b-button>
            </div>
          </section>
        </b-field>
      </b-modal>
    </b-field>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

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

  &-table {
    position: absolute;
    top: 72px;
    width: 90%;

    &-action {
      right: 0;
      position: absolute;
      top: -56px;
      width: 200px;
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

      &-del {
        border: 1px solid $danger;
        background-color: $danger;
      }

      &-add {
        background-color: #7957d5;
        margin-left: 20px;
      }

      .card {
        width: 30vw;
      }

      ::v-deep .animation-content {
        width: auto;
      }
    }

    &-total {
      position: absolute;
      bottom: 0;
      font-size: 20px;
    }

    .sed {
      color: $black;
      background-color: $warning;
      height: 30px;
      font-size: 14px;
      cursor: pointer;
    }

    ::v-deep .has-addons {
      flex-direction: column;
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
  }

  &-del {
    border-radius: 5px;
    ::v-deep .del {
      position: static;
      opacity: 1 !important;

      i {
        color: #e74e5b !important;
      }
    }
  }

  ::v-deep .pagination {
    flex-wrap: nowrap;
  }

  &-body {
    display: flex;
    position: relative;
    flex-direction: column;
    min-width: 600px;
    height: 500px;

    &-input {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      color: $black;

      .field {
        width: 85%;
      }
    }

    &-action {
      margin-top: auto;
      display: flex;
      justify-content: end;

      button {
        margin-left: 20px;
      }
    }
  }

  ::v-deep .field.has-addons .control:not(:last-child) {
    margin-right: 0;
  }
}
</style>
