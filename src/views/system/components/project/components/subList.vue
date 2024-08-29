<script setup>
import { ref, defineProps, getCurrentInstance, onMounted } from 'vue'
import { getProject, delProject } from '@/api/project'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  id: {
    type: Number
  }
})
const subData = ref([])
const getSubList = async () => {
  const res = await getProject(props.id)
  subData.value = res.sub_project_list
}
onMounted(() => {
  getSubList()
})
const instance = getCurrentInstance()
const delAdmit = (id) => {
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to delete?',
    canCancel: ['button'],
    onConfirm: async () => {
      await delProject({ project_id: Number(id) })
      getSubList()
    }
  })
}
</script>

<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Sub-Projects</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <div v-if="subData.length === 0"><p>No sub-project</p></div>
      <input
        class="modal-card-body-input"
        placeholder="Name Search"
        v-if="subData.length !== 0"
      />
      <div class="modal-card-body-sroll">
        <div v-for="(item, index) in subData" :key="index">
          <p>
            <b>{{ item.name }}</b>
          </p>
          <b-icon
            icon="delete-outline"
            type="is-danger"
            @click="delAdmit(item.id)"
            v-if="userStore.profileInfo.auth_list.includes('Project_edit')"
          ></b-icon>
          <p class="des">
            Created on
            {{ dayjs(item.create_time).toString().substring(5, 16) }}
            <br />
            Product count: {{ item.spu_amount }}
            <br />
            Description: {{ item.description || 'No description' }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';
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

  &-body {
    &-input {
      width: 300px;
      height: 40px;
      border: 1px solid $primary;
      margin-bottom: 24px;
      border-radius: 5px;
      text-indent: 10px;
      color: $black;

      &:focus {
        outline: 1px solid $primary;
      }
    }

    &-sroll {
      height: 600px;
      overflow: auto;
      div {
        width: 600px;
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 20px;

        & > span {
          width: 20px;
          padding-top: 6px;
          cursor: pointer;
        }

        & > p {
          width: 570px;
          font-size: 18px;
        }

        .des {
          background-color: #7957d5;
          width: 100%;
          margin-top: 4px;
          padding: 10px 20px 10px 10px;
          color: $light;
          border-radius: 5px;
        }
      }
    }
  }
}
</style>
