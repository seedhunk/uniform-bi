<script setup>
import { defineProps, ref, getCurrentInstance, watch } from 'vue'
import { modifyOrAddProject, delNotification, delProject } from '@/api/project'

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  mode: {
    type: Number
  },
  data: {
    type: Object
  }
})

const isSwitchedCustom = ref('No')
const proName = ref(props.mode === 1 ? props.data.name : '')
const company = ref(props.mode === 1 ? props.data.partner : '')
const des = ref(props.mode === 1 ? props.data.description : '')
const emit = defineEmits(['changeBlock', 'changeCheck'])
//修改请求
const modify = async () => {
  await modifyOrAddProject({
    id: props.data.id,
    name: proName.value,
    parent_id: props.data.parent_id,
    partner: company.value,
    description: des.value,
    encryption: props.data.encryption
  })
  emit('changeBlock', -1)
}
//添加请求
const add = async (id) => {
  await modifyOrAddProject({
    name: proName.value,
    parent_id: id,
    partner: company.value,
    description: des.value,
    encryption: generate_encryption()
  })
  if (id === 0) {
    emit('changeBlock', -1)
  } else {
    emit('changeBlock', 1, 1, props.data)
  }
}
//加密码生成
const generate_encryption = () => {
  if (isSwitchedCustom.value === 'Yes')
    return String(Math.floor(1000 + Math.random() * 9000))
  return ''
}

//页面退出事件
const instance = getCurrentInstance()
const handleEmit = (index) => {
  if (index === 0) {
    instance.proxy.$buefy.dialog.confirm({
      message: 'Are you sure to add this project?',
      canCancel: ['button'],
      onConfirm: () => {
        add(0)
      }
    })
  } else if (index === 1) {
    instance.proxy.$buefy.dialog.confirm({
      message: 'Are you sure to modify this project?',
      canCancel: ['button'],
      onConfirm: () => {
        modify()
      }
    })
  } else {
    instance.proxy.$buefy.dialog.confirm({
      message: 'Are you sure to add this sub-project?',
      canCancel: ['button'],
      onConfirm: () => {
        add(props.data.id)
      }
    })
  }
}
//项目信息没有添加或修改退出时检测来选择是否提示
const backCheck = () => {
  if (proName.value !== '' || company.value !== '' || company.value !== '') {
    instance.proxy.$buefy.dialog.confirm({
      message: 'Are you sure to exit without saving?',
      canCancel: ['button'],
      onConfirm: () => {
        emit('changeBlock', 1, 1, props.data)
      }
    })
  } else {
    emit('changeBlock', 1, 1, props.data)
  }
}

const isAllowed = ref(true)
watch([proName, company, des], ([newPro, newCom, newDes]) => {
  if (props.mode !== 1) {
    if (newPro || newCom || newDes) {
      emit('changeCheck', true)
    } else {
      emit('changeCheck', false)
    }
  } else {
    if (
      newPro !== props.data.name ||
      newCom !== props.data.partner ||
      newDes !== props.data.description
    ) {
      emit('changeCheck', true)
    } else {
      emit('changeCheck', false)
    }
  }

  if (newPro && newCom) {
    isAllowed.value = false
  } else {
    isAllowed.value = true
  }
})

//删除操作
const before_del = async () => {
  await delNotification({ project_id: Number(props.data.id) })
  delPro()
}

const delPro = () => {
  instance.proxy.$buefy.dialog.confirm({
    canCancel: ['button'],
    title: 'Warning',
    message:
      'After you delete this project, the profiles of customers associated with this project will no longer be able to purchase the products within this project. Are you sure you want to proceed?',
    confirmText: 'Delete',
    type: 'is-danger',
    hasIcon: true,
    onConfirm: async () => {
      await delProject({ project_id: Number(props.data.id) })
      emit('changeBlock', -1)
    }
  })
}
</script>

<template>
  <div class="rcMain">
    <button class="rcMain-back" @click="backCheck()" v-if="mode === 2">
      BACK
    </button>
    <button class="rcMain-back" @click="before_del()" v-if="mode === 1">
      DELETE
    </button>
    <b-button
      class="rcMain-add"
      @click="handleEmit(mode)"
      :disabled="isAllowed"
    >
      {{ mode === 1 ? 'MODIFY' : 'ADD' }}
    </b-button>
    <div class="rcMain-left" v-if="mode !== 1">
      <div class="rcMain-left-title">
        {{ mode === 0 ? 'Create a new project' : 'Create a new sub-project' }}
      </div>
      <div class="rcMain-left-line"></div>
      <div class="rcMain-left-detail">
        {{
          mode === 0
            ? 'Create a project to manage the cooperation with other companies.'
            : 'Create a sub-project to manage your product.'
        }}
        <br /><br />
        {{
          mode === 0
            ? '*For Angie company, the project name will display on the client app as the “school/company name”'
            : ''
        }}
      </div>
    </div>
    <div class="rcMain-right">
      <div class="rcMain-right-title">
        {{ mode === 2 ? 'Sub-project information' : 'Project information' }}
      </div>
      <div class="rcMain-right-line"></div>
      <div class="rcMain-right-detail">
        <div class="rcMain-right-detail-input" v-if="mode === 1">
          <p>Project id</p>
          <p>{{ mode === 1 ? data.id : 0 }}</p>
        </div>
        <div class="rcMain-right-detail-input">
          <p style="line-height: 20px">
            Project name<br />
            <b class="tip">It will be displayed on the client side</b>
          </p>
          <b-field>
            <b-input
              v-model="proName"
              placeholder="Enter the project name"
            ></b-input>
          </b-field>
        </div>
        <div class="rcMain-right-detail-input" v-if="mode === 0">
          <p style="line-height: 20px">
            Is this a public or private project?<br />
            <b class="tip"
              >Clients are required to view product in private project via
              code</b
            >
          </p>
          <b-field style="display: flex; justify-content: end">
            <b-switch
              v-model="isSwitchedCustom"
              true-value="Yes"
              false-value="No"
              >{{ isSwitchedCustom }}
            </b-switch>
          </b-field>
        </div>
        <div class="rcMain-right-detail-input">
          <p>Cooperated company</p>
          <b-field>
            <b-input
              v-model="company"
              placeholder="Enter the cooperated company"
            ></b-input>
          </b-field>
        </div>
        <div class="rcMain-right-detail-des">
          <p>Project description <b style="color: #27678c">(optional)</b></p>
          <b-field>
            <b-input
              maxlength="200"
              type="textarea"
              placeholder="Enter the description if there is"
              v-model="des"
            ></b-input>
          </b-field>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

.tip {
  font-size: 12px;
  width: 400px;
  color: $danger;
}

.rcMain {
  height: 100%;
  width: 100%;
  padding: 16px 60px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: end;

  &-back {
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

  &-add {
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

  &-left {
    box-shadow: 2px 10px 15px rgba(0, 0, 0, 0.25);
    height: 96%;
    width: 36%;
    margin-right: 4%;
    background-color: $light;

    &-title {
      padding: 5% 10%;
      height: auto;
      width: 100%;
      font-size: 20px;
      font-weight: 600;
      color: $black;
    }

    &-line {
      height: 1px;
      width: 100%;
      background-color: #d9d9d9;
    }

    &-detail {
      padding: 5% 10%;
      font-size: 18px;
    }
  }

  &-right {
    box-shadow: 2px 10px 15px rgba(0, 0, 0, 0.25);
    height: 96%;
    width: 60%;
    background-color: $light;

    &-title {
      padding: 3% 10%;
      height: auto;
      width: 100%;
      font-size: 20px;
      font-weight: 600;
      color: $black;
    }

    &-line {
      height: 1px;
      width: 100%;
      background-color: #d9d9d9;
    }

    &-detail {
      padding: 5% 10%;
      width: 100%;
      height: 90%;
      font-size: 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      &-input {
        width: 100%;
        height: 10%;
        display: flex;
        justify-content: space-between;

        .field {
          width: 50%;
        }
      }

      &-des {
        width: 100%;
        height: 60%;

        .field {
          padding-top: 20px;
        }
      }
    }
  }
}
</style>
