<script setup>
import { ref, watch, onMounted } from 'vue'
import { getProject } from '@/api/project'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()
// 扩展插件
import minMax from 'dayjs/plugin/minMax'
dayjs.extend(minMax)

//获取Project列表
const data = ref()
const total = ref()
var offset = 0
const getList = async (id) => {
  const res = await getProject(id, {
    offset,
    count: num.value,
    start_day: timeSelected
      ? dayjs(startTime.value[0]).format('YYYY-MM-DD')
      : null,
    end_day: timeSelected
      ? dayjs(startTime.value[1]).format('YYYY-MM-DD')
      : null,
    name: searchName.value
  })
  data.value = res.sub_project_list
  total.value = res.sub_project_count
}

//filter切换动画
const isright = ref(true)
const changeTab = (e) => {
  var input = document.getElementById('input')
  var form = document.getElementById('form')
  var icon = document.getElementById('icon')
  if (isright.value === true) {
    isright.value = false
    e.target.style.animationName = 'leftmove'
    e.target.style.animationDuration = '0.8s'
    e.target.style.animationFillMode = 'forwards'

    input.style.animationName = 'input-gone'
    input.style.animationDuration = '0.01s'
    input.style.animationFillMode = 'forwards'

    form.style.animationName = 'form-show'
    form.style.animationDuration = '0.8s'
    form.style.animationFillMode = 'forwards'

    icon.style.display = 'none'
  } else {
    isright.value = true
    e.target.style.animationName = 'rightmove'
    e.target.style.animationDuration = '0.8s'
    e.target.style.animationFillMode = 'forwards'

    input.style.animationName = 'input-show'
    input.style.animationDuration = '0.8s'
    input.style.animationFillMode = 'forwards'

    form.style.animationName = 'form-gone'
    form.style.animationDuration = '0.01s'
    form.style.animationFillMode = 'forwards'

    icon.style.display = ''
  }
}

//日期选择器逻辑
const startTime = ref()
var timeSelected = false
const clearstartTime = () => {
  startTime.value = null
}
watch(startTime, (newData) => {
  if (newData) {
    timeSelected = true
  } else {
    timeSelected = false
  }
  getList(0)
})

//name筛选
const searchName = ref()
const search = () => {
  getList(0)
}
const cancelSearch = () => {
  searchName.value = ''
  getList(0)
}

//响应式逻辑
const num = ref()
const tabelHeight = ref()
const changeDate = () => {
  if (document.body.clientWidth <= 1600) {
    tabelHeight.value = '62vh'
    num.value = 9
  } else if (document.body.clientWidth <= 872) {
    num.value = 6
  } else {
    num.value = 10
    tabelHeight.value = '70vh'
  }
}

onMounted(() => {
  changeDate()
  getList(0)
})

window.addEventListener('resize', () => {
  changeDate()
})

//分页后再次调接口(后端分页)
const onPageChange = (page) => {
  offset = (page - 1) * num.value
  getList(0)
}

//子传父，完成页面转换
const emit = defineEmits(['changeBlock'])
const handleEmit = (index, mode, data) => {
  emit('changeBlock', index, mode, data) //value是传给父元素事件的参数
}
</script>

<template>
  <div class="rcMain" id="rcMain">
    <input
      class="rcMain-input"
      placeholder="Name Search"
      id="input"
      v-model="searchName"
      @keyup.enter="search()"
      autocomplete="off"
    />
    <b-icon icon="close-circle" @click="cancelSearch()" id="icon"></b-icon>

    <div class="rcMain-form" id="form">
      <b-field class="rcMain-form-time">
        <b-datepicker
          v-model="startTime"
          rounded
          placeholder="Click to select..."
          icon="calendar-today"
          :icon-right="startTime ? 'close-circle' : ''"
          icon-right-clickable
          @icon-right-click="clearstartTime"
          horizontal-time-picker
          range
        >
        </b-datepicker
      ></b-field>
    </div>

    <button class="rcMain-button" @click="changeTab($event)"></button>

    <b-field class="rcMain-table">
      <b-table
        :data="data"
        :mobile-cards="false"
        :paginated="true"
        :per-page="num"
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
        default-sort="created_time"
        @page-change="onPageChange"
        :total="total"
        backend-pagination
      >
        <div class="rcMain-action">
          <button
            class="rcMain-action-add"
            @click="handleEmit(0, 0)"
            v-if="userStore.profileInfo.auth_list.includes('Project_edit')"
          >
            ADD
          </button>
        </div>

        <b-table-column
          field="name"
          label="Project name"
          width="200"
          centered
          sortable
        >
          <template v-slot="props">
            {{ props.row.name }}
          </template>
        </b-table-column>

        <b-table-column
          field="created_time"
          label="Create date"
          width="200"
          centered
          sortable
        >
          <template v-slot="props">
            {{ dayjs(props.row.created_time).format('YYYY-MM-DD HH:mm') }}
          </template>
        </b-table-column>

        <b-table-column
          field="spu_amount"
          label="Product count"
          width="200"
          centered
        >
          <template v-slot="props">
            {{ props.row.spu_amount }}
          </template>
        </b-table-column>

        <b-table-column
          field="company"
          label="Cooperated company"
          width="240"
          centered
        >
          <template v-slot="props">
            {{ props.row.partner }}
          </template>
        </b-table-column>

        <b-table-column field="action" width="200" centered>
          <template v-slot="props">
            <span
              class="tag edit"
              @click="handleEmit(0, 1, props.row)"
              v-if="userStore.profileInfo.auth_list.includes('Project_edit')"
            >
              Edit
            </span>
            <span class="tag view" @click="handleEmit(1, 1, props.row)">
              View detail
            </span></template
          >
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

@media (min-width: 1020px) {
  ::v-deep .table thead > tr {
    font-size: 16px;

    & > th {
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

    &-form {
      position: absolute;
      left: 120px;
      width: 0px;
      height: 40px;
      display: flex;
      overflow: hidden;

      &-time {
        width: 240px;
        height: 40px;
      }
    }

    &-button {
      position: absolute;
      left: 380px;
      width: 40px;
      height: 40px;
      background-image: url('@/assets/images/Vector.png');
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      border-radius: 5px;
    }

    &-action {
      position: absolute;
      top: -56px;
      right: 0;
      width: 180px;
      height: 40px;
      display: flex;
      justify-content: end;

      button {
        width: 80px;
        height: 100%;
        color: $light;
        font-weight: 600;
        border-radius: 5px;
      }

      &-add {
        background-color: #7957d5;
        margin-left: 20px;
      }
    }

    &-table {
      position: absolute;
      top: 72px;
      width: 90%;
    }

    &-total {
      position: absolute;
      bottom: 0;
      font-size: 20px;
    }
  }

  .edit {
    color: $black;
    background-color: $warning;
    height: 30px;
    font-size: 14px;
    margin-bottom: 6px;
    margin-left: 10px;
    cursor: pointer;
  }

  .view {
    color: $light;
    background-color: $secondary;
    height: 30px;
    font-size: 14px;
    margin-left: 10px;
    cursor: pointer;
  }
}

@media (max-width: 1020px) {
  ::v-deep .table thead > tr {
    font-size: 14px;

    & > td {
      vertical-align: middle;
    }
  }

  ::v-deep .table tbody > tr {
    font-size: 14px;

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

    &-form {
      position: absolute;
      left: 120px;
      width: 0px;
      height: 40px;
      display: flex;
      overflow: hidden;

      &-time {
        width: 250px;
        height: 40px;
      }
    }

    &-button {
      position: absolute;
      left: 380px;
      width: 40px;
      height: 40px;
      background-image: url('@/assets/images/Vector.png');
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      border-radius: 5px;
    }

    &-action {
      position: absolute;
      bottom: 0;
      width: 180px;
      height: 40px;
      display: flex;

      button {
        width: 80px;
        height: 100%;
        color: $light;
        font-weight: 600;
        border-radius: 5px;
      }

      &-add {
        background-color: #7957d5;
      }
    }

    &-table {
      position: absolute;
      top: 72px;
      width: 90%;
    }

    &-total {
      position: absolute;
      bottom: -6%;
      font-size: 20px;
    }
  }

  .edit {
    color: $black;
    background-color: $warning;
    height: 24px;
    font-size: 14px;
    margin-left: 10px;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .view {
    color: $light;
    background-color: $secondary;
    height: 24px;
    font-size: 14px;
    margin-left: 10px;
    cursor: pointer;
  }
}
</style>

<style>
@keyframes leftmove {
  0% {
  }

  100% {
    left: 60px;
  }
}

@keyframes rightmove {
  0% {
    left: 60px;
  }

  100% {
    left: 380px;
  }
}

@keyframes input-gone {
  0% {
  }

  100% {
    width: 0;
    display: none;
  }
}

@keyframes input-show {
  0% {
    width: 0;
    display: none;
  }

  100% {
    width: 300px;
    display: show;
  }
}

@keyframes form-gone {
  0% {
    width: 450px;
    display: show;
    overflow: visible;
  }

  100% {
    width: 0;
    display: none;
    overflow: hidden;
  }
}

@keyframes form-show {
  0% {
  }

  100% {
    width: 450px;
    display: show;
    overflow: visible;
  }
}
</style>
