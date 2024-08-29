<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue'
import { resetPwd } from '@/api/user'
import { ToastProgrammatic as Toast } from 'buefy'

const instance = getCurrentInstance()
var email
const code = ref()
const pwd = ref()
const cpwd = ref()
const isErro = ref(false)
const isNewErro = ref(false)
const admit = async () => {
  if (pwd.value === cpwd.value) {
    try {
      await resetPwd(email, code.value, pwd.value)
      Toast.open({
        type: 'is-success',
        message: 'Reset successfully!',
        duration: 5000
      })
      instance.proxy.$router.push('/login')
    } catch (err) {
      isErro.value = true
    }
  } else {
    isNewErro.value = true
  }
}

onMounted(() => {
  if (instance.proxy.$route.query.email) {
    email = instance.proxy.$route.query.email
  } else {
    instance.proxy.$router.push('/forget')
  }
})
</script>

<template>
  <div class="hero">
    <div class="hero-form">
      <!-- 标题 -->
      <section class="hero-form-title">Reset Your Password</section>

      <!-- 注册表单 -->
      <section class="hero-form-detail">
        <b-field>
          <b-icon
            icon="arrow-left"
            size="is-medium"
            @click="
              $router.push({
                path: '/forget',
                query: { email: email }
              })
            "
          ></b-icon>
        </b-field>

        <b-field
          label="Verification code"
          :type="isErro ? 'is-danger' : ''"
          :message="isErro ? 'The verification code is wrong' : ''"
        >
          <b-input
            v-model="code"
            placeholder="Please enter your verification code"
            @focus="isErro = false"
          ></b-input>
        </b-field>

        <b-field label="New password" :type="isNewErro ? 'is-danger' : ''">
          <b-input
            v-model="pwd"
            placeholder="Please enter your new password"
            @focus="isNewErro = false"
          ></b-input>
        </b-field>

        <b-field
          label="Confirm new password"
          :type="isNewErro ? 'is-danger' : ''"
          :message="
            isNewErro
              ? 'Please ensure the new password and confirm password are the same'
              : ''
          "
        >
          <b-input
            v-model="cpwd"
            placeholder="Please confirm your new password"
            @focus="isNewErro = false"
          ></b-input>
        </b-field>

        <b-field>
          <b-button @click="admit()">Reset</b-button>
        </b-field>
      </section>

      <!-- 底部协议 -->
      <section class="hero-form-policy">
        Registering to this website, you accept our Terms of use and our privacy
        policy
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

.hero {
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;

  &-form {
    margin-bottom: 10%;

    &-title {
      width: 100%;
      text-align: center;
      font-size: 36px;
      font-weight: 600;
      color: #000;
      margin-bottom: 30px;
    }

    &-detail {
      height: 90%;
      padding: 60px 30px 0;
      background-color: white;
      color: $black;
      border: solid 2px $primary;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);

      .field {
        padding: 10px 30px 10px;
        margin: 0;

        &:nth-child(1) {
          padding: 0px 30px 20px;
          .icon {
            cursor: pointer;
            color: $primary;
          }
        }

        &:nth-child(5) {
          padding: 40px 30px 0px;

          .button {
            width: 100%;
            background-color: $primary;
            color: black;
            font-weight: 600;
          }
        }
      }
    }

    &-policy {
      text-align: center;
      margin-top: 30px;
      color: #000;
    }
  }
}
</style>
