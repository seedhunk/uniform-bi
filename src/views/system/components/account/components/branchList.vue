<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { getBranch, postBranch, delBranch } from '@/api/branch.js'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()
//获取branch列表
const data = ref()
const total = ref()
const getList = async () => {
  const res = await getBranch(offset, num.value, searchName.value)
  data.value = res.branch_list
  total.value = res.branch_count
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
const selectData = ref([])
const selectName = ref()
const mode = ref()
const showEdit = (data, index) => {
  isModalActive.value = true
  selectData.value = JSON.parse(JSON.stringify(data))
  selectName.value = data.name
  mode.value = index
}

const showAdd = (index) => {
  isModalActive.value = true
  selectData.value = []
  mode.value = index
}

const instance = getCurrentInstance()
const submit = async () => {
  if (!selectData.value.name || !selectData.value.name) {
    instance.proxy.$buefy.toast.open({
      message: 'Please finish the form before submission',
      type: 'is-danger'
    })
  } else {
    await postBranch({
      branch_name: selectData.value.name,
      branch_address: selectData.value.address,
      branch_phone: selectData.value.phone,
      branch_id: selectData.value.id ? selectData.value.id : -1
    })
    instance.proxy.$buefy.toast.open({
      message: selectData.value.id ? 'Edit success!' : 'Add success!',
      type: 'is-success'
    })
    isModalActive.value = false
    getList()
  }
}

const delAction = (id, name) => {
  instance.proxy.$buefy.dialog.prompt({
    message: `Please enter the '${name}' in the input field to confirm the deletion`,
    inputAttrs: {
      type: 'text'
    },
    trapFocus: true,
    canCancel: ['button'],
    onConfirm: async (value) => {
      if (value === name) {
        await delBranch(id)
        instance.proxy.$buefy.toast.open({
          message: 'Delete success!',
          type: 'is-success'
        })
        isModalActive.value = false
        getList()
      } else {
        instance.proxy.$buefy.toast.open({
          message: 'Branch name is wrong!',
          type: 'is-danger'
        })
      }
    }
  })
}
</script>

<template>
  <div class="rcMain">
    <input
      class="rcMain-input"
      placeholder="Name/Address Search"
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

        <b-table-column width="50" centered v-slot="props">
          <span class="tag base" v-if="props.row.id === 1"> Base </span>
        </b-table-column>

        <b-table-column field="name" label="Branch name" width="250" centered>
          <template v-slot="props">
            {{ props.row.name }}
          </template>
        </b-table-column>

        <b-table-column field="address" label="Address" width="200" centered>
          <template v-slot="props">
            {{ props.row.address }}
          </template>
        </b-table-column>

        <b-table-column label="Role" width="150" centered>
          <template v-slot="props">
            <span
              class="tag sed"
              @click="$emit('changeBlock', 0, props.row.id)"
            >
              View role
            </span>
          </template>
        </b-table-column>

        <b-table-column label="Staff" width="150" centered>
          <template v-slot="props">
            <span
              class="tag sed"
              @click="$emit('changeBlock', 1, props.row.id)"
            >
              View Staff
            </span>
          </template>
        </b-table-column>

        <b-table-column
          width="100"
          centered
          v-slot="props"
          v-if="userStore.profileInfo.auth_list.includes('Account_edit')"
        >
          <span
            class="tag edit"
            @click="showEdit(props.row, 1)"
            v-if="props.row.id !== 1"
          >
            Edit
          </span>
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
            <b-icon
              v-if="
                userStore.profileInfo.auth_list.includes('Account_delete') &&
                mode === 1
              "
              icon="delete-outline"
              class="del"
              @click="
                $buefy.dialog.confirm({
                  canCancel: ['button'],
                  title: 'Warning',
                  message:
                    'When you delete a branch, the associated roles, staffs, and each staff\'s corresponding account will also be deleted along with it. Do you confirm that you want to delete?',
                  confirmText: 'Delete',
                  type: 'is-danger',
                  hasIcon: true,
                  onConfirm: () => {
                    delAction(selectData.id, selectName)
                  }
                })
              "
            ></b-icon>
          </header>
          <section class="modal-card-body">
            <div class="modal-card-body-input">
              <p>Branch name</p>
              <b-field>
                <b-input
                  v-model="selectData.name"
                  placeholder="Enter the Role name"
                ></b-input>
              </b-field>
            </div>
            <div class="modal-card-body-input">
              <p>Branch address</p>
              <b-field>
                <b-input
                  v-model="selectData.address"
                  placeholder="Enter the Role name"
                ></b-input>
              </b-field>
            </div>
            <div class="modal-card-body-input">
              <p>Contact number</p>
              <b-field>
                <b-input
                  v-model="selectData.phone"
                  placeholder="Enter the Contact number"
                ></b-input>
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

  td:nth-child(1) {
    padding: 0;
  }

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
      color: $light;
      background-color: $secondary;
      height: 30px;
      font-size: 14px;
      cursor: pointer;
    }

    .edit {
      color: $black;
      background-color: $warning;
      height: 30px;
      font-size: 14px;
      cursor: pointer;
    }

    .base {
      color: $light;
      background-color: #7957d5;
      height: 30px;
      font-size: 14px;
      cursor: default;
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
    display: flex;
    justify-content: space-between;

    ::v-deep .del {
      position: static;
      opacity: 1 !important;

      i {
        color: #e74e5b !important;
      }
    }
  }

  &-title {
    font-size: 24px;
    color: $light;
    font-weight: 600;
  }

  ::v-deep .pagination {
    flex-wrap: nowrap;
  }

  &-body {
    display: flex;
    position: relative;
    flex-direction: column;
    min-width: 600px;
    min-height: 250px;

    &-input {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      color: $black;

      .field {
        width: 65%;
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
