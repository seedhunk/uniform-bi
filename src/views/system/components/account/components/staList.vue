<script setup>
import { ref, onMounted, defineProps, getCurrentInstance } from 'vue'
import { getSta, addSta, delSta } from '@/api/staff.js'
import { getRole } from '@/api/role.js'
import { singup } from '@/api/user'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  id: {
    type: Number
  }
})

//获取staff列表
const data = ref()
const total = ref()
const getList = async () => {
  const res = await getSta(props.id, offset, num.value, searchName.value)
  data.value = res.staff_list
  total.value = res.staff_count
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
  getRoleList()
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
const selectName = ref()
const mode = ref()
const showEdit = (data, index) => {
  isModalActive.value = true
  selectData.value = JSON.parse(JSON.stringify(data))
  selectName.value = data.name
  mode.value = index
}

const roleList = ref()
const getRoleList = async () => {
  const res = await getRole(props.id)
  roleList.value = res.role_list
}

const showAdd = (index) => {
  isModalActive.value = true
  selectData.value = {}
  mode.value = index
}

const psw_generator = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-='
  const charSet = lowercase + uppercase + digits + symbols

  let password = ''

  for (let i = 0; i < 12; i++) {
    password += charSet.charAt(Math.floor(Math.random() * charSet.length))
  }

  return password
}
const create_account = async () => {
  if (!selectData.value.email) {
    instance.proxy.$buefy.toast.open({
      message: 'Please finish the form before submission',
      type: 'is-danger'
    })
  } else {
    const id = await singup(
      new URLSearchParams({
        username: selectData.value.email,
        password: psw_generator()
      })
    )
    submit(id)
  }
}
const submit = async (id) => {
  if (
    !selectData.value.name ||
    !selectData.value.id_card ||
    !selectData.value.role
  ) {
    instance.proxy.$buefy.toast.open({
      message: 'Please finish the form before submission',
      type: 'is-danger'
    })
  } else {
    await addSta({
      user_id: id,
      staff_name: selectData.value.name,
      staff_id_card: selectData.value.id_card,
      role_id: selectData.value.role,
      staff_id: selectData.value.id ? selectData.value.id : -1
    })
    instance.proxy.$buefy.toast.open({
      message: selectData.value.id ? 'Edit success!' : 'Add success!',
      type: 'is-success'
    })
    isModalActive.value = false
    getList()
  }
}

//删除操作
const instance = getCurrentInstance()
const delsubmit = async (id) => {
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to delete?',
    canCancel: ['button'],
    onConfirm: async () => {
      await delSta(id)
      instance.proxy.$buefy.toast.open({
        message: 'Delete success!',
        type: 'is-success'
      })
      getList()
      isModalActive.value = false
    }
  })
}
</script>

<template>
  <div class="rcMain">
    <input
      class="rcMain-input"
      placeholder="Name/ID Search"
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
        @page-change="onPageChange"
        :total="total"
        backend-pagination
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
      >
        <div class="rcMain-table-action">
          <button
            class="rcMain-table-action-add"
            @click="showAdd(0)"
            v-if="userStore.profileInfo.auth_list.includes('Account_edit')"
          >
            Create new staff account
          </button>
        </div>

        <b-table-column field="name" label="Staff name" width="200" centered>
          <template v-slot="props">
            {{ props.row.name }}
          </template>
        </b-table-column>

        <b-table-column
          field="id"
          label="Staff ID"
          width="250"
          centered
          sortable
        >
          <template v-slot="props">
            {{ props.row.id_card }}
          </template>
        </b-table-column>

        <b-table-column field="email" label="Email" width="250" centered>
          <template v-slot="props"> {{ props.row.email }} </template>
        </b-table-column>

        <b-table-column field="email" label="Role" width="250" centered>
          <template v-slot="props">
            {{
              roleList
                ? roleList.filter((item) => item.id == props.row.role)[0].name
                : ''
            }}
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
              {{
                mode === 1 ? selectName + ' / Edit' : 'Create new staff account'
              }}
            </p>
            <b-icon
              icon="delete-outline"
              class="del"
              @click="delsubmit(selectData.id)"
              v-if="
                userStore.profileInfo.auth_list.includes('Account_delete') &&
                mode === 1
              "
            ></b-icon>
          </header>
          <section class="modal-card-body">
            <div class="modal-card-body-input">
              <p>Staff name</p>
              <b-field>
                <b-input
                  v-model="selectData.name"
                  placeholder="Enter the Staff name"
                ></b-input>
              </b-field>
            </div>
            <div class="modal-card-body-input">
              <p>Staff ID</p>
              <b-field>
                <b-input
                  v-model="selectData.id_card"
                  placeholder="Enter the Staff ID"
                ></b-input>
              </b-field>
            </div>
            <div class="modal-card-body-input">
              <p>Email</p>
              <b-field>
                <b-input
                  v-model="selectData.email"
                  placeholder="Enter the email"
                ></b-input>
              </b-field>
            </div>
            <div class="modal-card-body-input">
              <p>Role</p>
              <b-field>
                <b-select
                  v-model="selectData.role"
                  style="width: 100%"
                  placeholder="Select a role"
                >
                  <option
                    v-for="item in roleList"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="modal-card-body-action">
              <b-button type="is-danger" @click="isModalActive = false"
                >Cancel</b-button
              >
              <b-button
                type="is-primary"
                @click="
                  selectData.id ? submit(selectData.user_id) : create_account()
                "
                >Submit</b-button
              >
            </div>
          </section>
        </b-field>
      </b-modal>
    </b-field>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

::v-deep .input::-webkit-input-placeholder {
  color: $black;
  opacity: 0.5;
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

  &-table {
    position: absolute;
    top: 72px;
    width: 90%;

    &-action {
      right: 0;
      position: absolute;
      top: -56px;
      min-width: 200px;
      height: 40px;
      display: flex;
      justify-content: end;

      button {
        min-width: 80px;
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

    .sed {
      color: $black;
      background-color: $warning;
      height: 30px;
      font-size: 14px;
      margin-left: 10px;
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
    height: 500px;

    &-input {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      color: $black;

      .field {
        width: 75%;
      }

      ::v-deep .select {
        display: flex;
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
