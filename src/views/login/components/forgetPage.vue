<script setup>
// import SvgIcon from '@jamescoyle/vue-icon'
// import { mdiEyeClosed } from '@mdi/js'
import { ref, getCurrentInstance, onMounted } from 'vue'
import { sendMailToRest } from '@/api/user'
import { useTimerStore } from '@/stores/counter'

const timerStore = useTimerStore()
const email = ref('')
const isErro = ref(false)
const instance = getCurrentInstance()
const sendMail = async () => {
  try {
    await sendMailToRest(email.value)
    timerStore.setTimer()
    instance.proxy.$router.push({
      path: '/reset',
      query: { email: email.value }
    })
  } catch (err) {
    isErro.value = true
  }
}

onMounted(() => {
  timerStore.checkTimer()
  if (instance.proxy.$route.query.email) {
    email.value = instance.proxy.$route.query.email
  }
})

const message = () => {
  if (timerStore.count === 60) {
    return 'Send verification code'
  } else {
    return 'You can resend it after ' + timerStore.count + ' seconds'
  }
}
</script>

<template>
  <div class="hero">
    <div class="hero-form">
      <!-- 标题 -->
      <section class="hero-form-title">Forget Your Password</section>

      <!-- 注册表单 -->
      <section class="hero-form-detail">
        <b-field>
          <p>
            We will send you a verification code to your email for reset your
            password
          </p>
        </b-field>

        <b-field
          label="Your email"
          :type="isErro ? 'is-danger' : ''"
          :message="isErro ? 'The email is invalid' : ''"
        >
          <b-input
            v-model="email"
            placeholder="Please enter your email"
            @focus="isErro = false"
          ></b-input>
        </b-field>

        <b-field>
          <div @click="$router.push('/login')">Sign in</div>
        </b-field>

        <b-field>
          <b-button @click="sendMail()" :disabled="timerStore.count !== 60">{{
            message()
          }}</b-button>
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
        padding: 20px 30px 40px;
        margin: 0;

        &:nth-child(1) {
          text-align: center;
        }

        &:nth-child(2) {
          padding: 10px 30px 0;
        }

        &:nth-child(3) {
          padding: 10px 30px 20px;

          div {
            width: 50%;
            cursor: pointer;
          }

          div:hover {
            color: $secondary;
          }
        }

        &:nth-child(4) {
          padding: 40px 30px 0;

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
