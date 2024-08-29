<script setup>
import {
  ref,
  getCurrentInstance,
  onUpdated,
  onMounted,
  onBeforeMount,
  provide
} from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/counter'
import { changePwd } from '@/api/user.js'
import socket from '@/utils/commonJs/socket.js'

//获取用户数据
const userStore = useUserStore()

//菜单选择高亮逻辑
//获取当前路由来知晓目前应高亮的dom
const router = useRouter()
var currentPath = router.currentRoute.value.path
const height = ref()

//获取个人信息
const warningData = ref()
const open = ref(false)
provide('open', open)

socket.onmessage = (event) => {
  warningData.value = JSON.parse(event.data)
}

onBeforeMount(() => {
  socket.onopen = () => {
    socket.send(
      JSON.stringify({ branch_id: userStore.profileInfo.branch_list[0].id })
    )
  }
})

onMounted(() => {
  //slice的作用是去掉路由路径前面的'/'以方便匹配
  document.getElementById(currentPath.slice(1)).style.backgroundColor =
    '#d1caf2'
  height.value = document.getElementById('right').offsetHeight
  // eslint-disable-next-line no-undef
  translate.execute()
})

onUpdated(() => {
  //dom更新后先删除之前的高亮类
  document.getElementById(currentPath.slice(1)).style.backgroundColor =
    '#534F67'
  //获取新的选中dom并设置高亮
  currentPath = router.currentRoute.value.path
  document.getElementById(currentPath.slice(1)).style.backgroundColor =
    '#d1caf2'
})

window.addEventListener('resize', () => {
  height.value = document.getElementById('right').offsetHeight
})

//点击逻辑
const isModalActive1 = ref(false)
const isModalActive2 = ref(false)
const showProduct = ref(true)
const clickEvent = (path, id) => {
  if (id === 1) {
    showProduct.value = true
    router.push(path)
  } else {
    router.push(path)
  }
}

//修改密码
const oldPwd = ref()
const newPwd = ref()
const cnewPwd = ref()
const isErro = ref(false)
const isNewErro = ref(false)
const instance = getCurrentInstance()
const admit = () => {
  if (newPwd.value === cnewPwd.value) {
    instance.proxy.$buefy.dialog.confirm({
      message: 'Are you sure to admit?',
      canCancel: ['button'],
      onConfirm: async () => {
        try {
          await changePwd({
            old_password: oldPwd.value,
            new_password: newPwd.value
          })
          router.push('/login')
          userStore.clearProfile()
        } catch (err) {
          isErro.value = true
        }
      }
    })
  } else {
    isNewErro.value = true
  }
}
const cancel = () => {
  isModalActive2.value = false
  oldPwd.value = null
  newPwd.value = null
  cnewPwd.value = null
  isErro.value = false
  isNewErro.value = false
}
</script>

<template>
  <div class="page">
    <div class="right">
      <p class="right-title" id="right">Business Intelligence System</p>
      <b-menu>
        <b-menu-item
          icon="view-dashboard"
          label="Dashboard"
          id="dashboard"
          @click="clickEvent('/dashboard', 1)"
          v-if="userStore.profileInfo.branch_list[0].id !== 1"
        >
        </b-menu-item>
        <b-menu-item
          icon="file-cabinet"
          label="Project"
          id="project"
          @click="clickEvent('/project', 1)"
          v-if="userStore.profileInfo.auth_list.includes('Project_view')"
        >
        </b-menu-item>
        <b-menu-item
          :icon="showProduct ? 'cube-outline' : 'menu-down-outline'"
          @click="showProduct = !showProduct"
          v-if="
            userStore.profileInfo.auth_list.includes('Product_view') ||
            userStore.profileInfo.auth_list.includes('Inventory_view')
          "
        >
          <template #label> Product Management </template>
          <b-menu-item
            icon="circle-medium"
            label="All Product"
            id="allproduct"
            @click="clickEvent('/allproduct', 2)"
            v-if="userStore.profileInfo.auth_list.includes('Product_view')"
          ></b-menu-item>
          <b-menu-item
            icon="circle-medium"
            label="Inventory"
            id="inventory"
            @click="clickEvent('/inventory', 2)"
            v-if="userStore.profileInfo.auth_list.includes('Inventory_view')"
          ></b-menu-item>
        </b-menu-item>
        <b-menu-item
          icon="invoice-list-outline"
          label="Order Management"
          id="order"
          @click="clickEvent('/order', 1)"
          v-if="userStore.profileInfo.auth_list.includes('Order_view')"
        >
        </b-menu-item>
        <b-menu-item
          icon="ruler"
          label="Rule Management"
          id="rule"
          @click="clickEvent('/rule', 1)"
          v-if="userStore.profileInfo.auth_list.includes('Rule_view')"
        >
        </b-menu-item>
        <b-menu-item
          icon="chart-bar"
          label="Report"
          id="report"
          @click="clickEvent('/report', 1)"
        >
        </b-menu-item>
        <b-menu-item
          icon="text-account"
          label="Account Management"
          id="account"
          @click="clickEvent('/account', 1)"
          v-if="userStore.profileInfo.auth_list.includes('Account_view')"
        >
        </b-menu-item>
        <b-menu-item
          icon="account-supervisor-circle"
          label="Customers Management"
          id="customer"
          @click="clickEvent('/customer', 1)"
          v-if="userStore.profileInfo.auth_list.includes('Customer_view')"
        >
        </b-menu-item>
        <b-menu-item
          icon="image"
          label="Media Management"
          id="media"
          @click="clickEvent('/media', 1)"
          v-if="
            userStore.profileInfo.branch_list[0].id === 1 ||
            userStore.profileInfo.branch_list[0].id === 0
          "
        >
        </b-menu-item>
      </b-menu>
    </div>
    <div class="left">
      <div class="left-header" :style="{ height: height + 'px' }">
        <b-icon
          class="left-header-warning_item"
          icon="new-box"
          v-show="warningData ? warningData.isNew : false"
          @click="
            $buefy.dialog.confirm({
              message: 'You have new orders to check.',
              cancelText: 'Later',
              confirmText: 'Go to check',
              canCancel: ['button'],
              onConfirm: () => {
                clickEvent('/order', 1)
              }
            })
          "
        >
        </b-icon>
        <b-icon
          class="left-header-warning_item"
          icon="invoice-list-outline"
          v-show="warningData ? warningData.orders : false"
          @click="
            $buefy.dialog.confirm({
              message: 'You have orders pending transfer from other branches.',
              cancelText: 'Later',
              confirmText: 'Go to comfirm',
              canCancel: ['button'],
              onConfirm: () => {
                open = true
                clickEvent('/order', 1)
              }
            })
          "
        >
        </b-icon>
        <b-icon
          class="left-header-warning_item"
          icon="cube-outline"
          v-show="warningData ? warningData.inventory : false"
          @click="
            $buefy.dialog.confirm({
              message:
                'Some of your product inventory levels have fallen below the set threshold.',
              cancelText: 'Later',
              confirmText: 'Go to add',
              canCancel: ['button'],
              onConfirm: () => {
                clickEvent('/inventory', 2)
              }
            })
          "
        >
        </b-icon>
        <div class="left-header-account" @click="isModalActive1 = true">
          <b-icon icon="account" class="account"> </b-icon>
          <p>
            {{ userStore.profileInfo ? userStore.profileInfo.staff_name : '' }}
          </p>
        </div>
        <div
          class="left-header-logout"
          @click="
            $buefy.dialog.confirm({
              message: 'Are you sure to log out?',
              canCancel: ['button'],
              onConfirm: () => {
                this.$router.push('/login')
                userStore.clearProfile()
              }
            })
          "
        >
          <b-icon icon="logout"> </b-icon>
          <p>Logout</p>
        </div>
        <ul class="ignore">
          <li>
            <a href="javascript:translate.changeLanguage('english');"
              ><p>English</p></a
            >
          </li>
          |
          <li>
            <a href="javascript:translate.changeLanguage('chinese_simplified');"
              ><p id="chinese">简体中文</p></a
            >
          </li>
          |
          <li>
            <a
              href="javascript:translate.changeLanguage('chinese_traditional');"
              ><p id="chinese_traditional">繁体中文</p></a
            >
          </li>
        </ul>
      </div>
      <div class="left-main"><router-view></router-view></div>
    </div>
    <!-- Account information -->
    <b-modal v-model="isModalActive1" has-modal-card :canCancel="['button']">
      <b-field class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Account information</p>
          <button
            type="button"
            class="delete"
            @click="isModalActive1 = false"
          />
        </header>
        <section class="modal-card-body">
          <b-field>
            <div class="modal-card-body-line">
              <p>Email</p>
              <b-field type="is-primary">
                <b-input
                  :value="userStore.profileInfo.email"
                  disabled
                ></b-input>
              </b-field>
            </div>

            <div class="modal-card-body-line">
              <p>Staff name</p>
              <b-field type="is-primary">
                <b-input
                  :value="userStore.profileInfo.staff_name"
                  disabled
                ></b-input>
              </b-field>
            </div>

            <div class="modal-card-body-line">
              <p></p>
              <div
                class="pwd"
                @click="
                  // eslint-disable-next-line prettier/prettier
                  isModalActive1 = false;
                  isModalActive2 = true
                "
              >
                change password
              </div>
            </div>
          </b-field>
        </section>
      </b-field>
    </b-modal>
    <!-- Change Password -->
    <b-modal v-model="isModalActive2" has-modal-card :canCancel="['button']">
      <b-field class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Change password</p>
        </header>
        <section class="modal-card-body">
          <b-field>
            <div class="modal-card-body-line">
              <p>Old password</p>
              <b-field
                :type="isErro ? 'is-danger' : 'is-primary'"
                :message="isErro ? 'The old password is wrong' : ''"
              >
                <b-input
                  v-model="oldPwd"
                  @focus="isErro = false"
                  placeholder="Please enter your old password"
                ></b-input>
              </b-field>
            </div>

            <div class="modal-card-body-line">
              <p>New password</p>
              <b-field :type="isNewErro ? 'is-danger' : 'is-primary'">
                <b-input
                  v-model="newPwd"
                  @focus="isNewErro = false"
                  placeholder="Please enter your new password"
                ></b-input>
              </b-field>
            </div>

            <div class="modal-card-body-line">
              <p>Confirm new password</p>
              <b-field
                :type="isNewErro ? 'is-danger' : 'is-primary'"
                :message="
                  isNewErro
                    ? 'Please ensure the new password and confirm password are the same'
                    : ''
                "
              >
                <b-input
                  v-model="cnewPwd"
                  @focus="isNewErro = false"
                  placeholder="Please confirm your new password"
                ></b-input>
              </b-field>
            </div>

            <div class="modal-card-body-line" style="justify-content: end">
              <b-button
                type="is-danger"
                @click="cancel()"
                style="margin-right: 24px"
                >Cancel</b-button
              >
              <b-button type="is-primary" @click="admit()">Save</b-button>
            </div>
          </b-field>
        </section>
      </b-field>
    </b-modal>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

.account {
  ::v-deep .mdi-24px.mdi:before {
    font-size: 28px;
  }
}

@media (min-width: 1120px) {
  .page {
    display: flex;

    .right {
      height: 100vh;
      flex: 1;
      background-color: $tertiary;

      &-title {
        color: $light;
        width: 100%;
        font-size: 150%;
        padding: 5% 0 5%;
        font-weight: 600;
        text-align: center;
        cursor: default;
      }

      ::v-deep .icon-text {
        background-color: $tertiary;
        flex-wrap: nowrap;
        color: $light;
        font-size: 18px;
        padding: 5% 0 5% 8%;
        width: 100%;

        .icon {
          height: 100%;
          padding-right: 6%;
          margin: 0;
        }
      }

      li > ul > li {
        background-color: #25232e;

        ::v-deep .icon-text {
          padding: 4% 0 4% 14%;
        }
      }
    }

    .left {
      min-height: 100vh;
      height: auto;
      flex: 4;
      display: flex;
      flex-direction: column;

      &-header {
        z-index: 1;
        background-color: $light;
        box-shadow: 0 2px 4px 0 rgba($color: #000000, $alpha: 0.25);
        display: flex;
        justify-content: end;
        align-items: center;

        &-item {
          width: 40px;
          height: 100%;
          margin: 0 20px;
        }

        &-warning_item {
          position: relative;
          color: $danger;
          width: 40px;
          height: 100%;
          margin: 0 20px 0 0;
          cursor: pointer;

          &::after {
            position: absolute;
            content: '';
            background-color: rgb(211, 60, 60);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            left: 4px;
            top: 28%;
          }
        }

        &-account {
          margin: 0 20px 0 0;
          max-width: 200px;
          display: flex;
          justify-content: end;
          align-items: center;
          font-size: 16px;
          cursor: pointer;

          p {
            max-width: 150px;
            margin-left: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          &:hover {
            color: $primary;
          }
        }

        &-logout {
          width: 100px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          margin-right: 10px;
          cursor: pointer;

          p {
            width: 72%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          &:hover {
            color: $danger;
          }
        }

        .ignore {
          width: 240px;
          display: flex;
          justify-content: space-around;
          p {
            color: $black;

            &:hover {
              color: $primary;
            }
          }
        }
      }

      &-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
      }
    }
  }
}

@media (max-width: 1120px) {
  .page {
    display: flex;

    .right {
      height: 100vh;
      flex: 1;
      background-color: $tertiary;

      &-title {
        color: $light;
        width: 100%;
        font-size: 120%;
        padding: 5% 0 5%;
        font-weight: 600;
        text-align: center;
        cursor: default;
      }

      ::v-deep .icon-text {
        background-color: $tertiary;
        flex-wrap: nowrap;
        color: $light;
        font-size: 16px;
        padding: 5% 0 5% 8%;
        width: 100%;

        .icon {
          height: 100%;
          padding-right: 6%;
          margin: 0;
        }
      }

      li > ul > li {
        background-color: #25232e;

        ::v-deep .icon-text {
          padding: 4% 0 4% 14%;
        }
      }
    }

    .left {
      min-height: 100vh;
      height: auto;
      flex: 4;
      display: flex;
      flex-direction: column;

      &-header {
        z-index: 1;
        background-color: $light;
        box-shadow: 0 2px 4px 0 rgba($color: #000000, $alpha: 0.25);
        display: flex;
        justify-content: end;
        align-items: center;

        &-warning_item {
          position: relative;
          color: $danger;
          width: 40px;
          height: 100%;
          margin: 0 20px;
          cursor: pointer;

          &::after {
            position: absolute;
            content: '';
            background-color: rgb(224, 35, 35);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            left: 0;
            top: 28%;
          }
        }

        &-account {
          margin: 0 20px 0 0;
          max-width: 200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          cursor: pointer;

          p {
            max-width: 150px;
            margin-left: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          &:hover {
            color: $primary;
          }
        }

        &-logout {
          width: 100px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          margin-right: 10px;
          cursor: pointer;

          p {
            width: 72%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          &:hover {
            color: $danger;
          }
        }

        .ignore {
          width: 240px;
          display: flex;
          justify-content: space-around;
          p {
            color: $black;

            &:hover {
              color: $primary;
            }
          }
        }
      }

      &-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
      }
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
      .pwd {
        cursor: pointer;

        &:hover {
          color: $secondary;
        }
      }
    }
  }
}
</style>
