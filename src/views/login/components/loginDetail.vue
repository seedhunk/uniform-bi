<script setup>
// import SvgIcon from '@jamescoyle/vue-icon'
// import { mdiEyeClosed } from '@mdi/js'
import { onMounted, ref } from 'vue'
import { putUserDetail, getSelf } from '@/api/user'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/counter'
import { ToastProgrammatic as Toast } from 'buefy'

//获取用户数据
const userStore = useUserStore()
//icon路径
// const path = mdiEyeClosed
const name = ref('')
const password = ref('')
const router = useRouter()
const profile = ref()
const isErro = ref(false)

const active = ref(false)
const login = async () => {
  try {
    const res = await putUserDetail(
      new URLSearchParams({
        username: name.value,
        password: password.value
      }),
      active.value ? 1.34 : 0.36
    )
    profile.value = res
  } catch (err) {
    isErro.value = true
  }
  //存储到仓库
  if (profile.value) {
    if (profile.value.is_staff) {
      localStorage.setItem(
        'login',
        JSON.stringify({
          token: profile.value.access_token,
          exp: Date.now() + (active.value ? 1.34 : 0.36) * 24 * 60 * 60 * 1000
        })
      )
      getSelfInfo()
    } else {
      Toast.open({
        type: 'is-danger',
        message: 'This account is not an staff account!'
      })
      profile.value = null
    }
  }
}

const getSelfInfo = async () => {
  const res = await getSelf()
  userStore.setProfileInfo(res)
  if (res.branch_list[0].id === 1) router.push('/report')
  else router.push('/system')
}

onMounted(() => {
  if (localStorage.getItem('login')) {
    getSelfInfo()
  }
})
</script>

<template>
  <div class="hero">
    <div class="hero-form">
      <!-- 标题 -->
      <section class="hero-form-title">Sign In to Your Account</section>

      <!-- 注册表单 -->
      <section class="hero-form-detail">
        <b-field label="Email" :type="isErro ? 'is-danger' : ''">
          <b-input
            v-model="name"
            placeholder="Please enter Username or email"
            @focus="isErro = false"
          ></b-input>
        </b-field>

        <b-field
          label="Password"
          :type="isErro ? 'is-danger' : ''"
          :message="
            isErro ? 'Username/email or password is invalid, please check' : ''
          "
        >
          <b-input
            type="password"
            placeholder="Password enter password"
            v-model="password"
            password-reveal
            @focus="isErro = false"
          >
          </b-input>
        </b-field>

        <b-field>
          <div @click="$router.push('/forget')">Forget password</div>
        </b-field>
        <b-field>
          <b-checkbox v-model="active">Keep me sign in</b-checkbox>
        </b-field>

        <b-field>
          <b-button @click="login">Sign In</b-button>
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
        padding: 0 30px 20px;
        margin: 0;

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
        }

        &:nth-child(5) {
          padding: 10px 30px 0;

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
