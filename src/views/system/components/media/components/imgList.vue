<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { getImg, putImg, delImg } from '@/api/media.js'
import dayjs from 'dayjs'

//获取img列表
const data = ref()
const total = ref()
const getList = async (offset, count) => {
  const res = await getImg(offset, count)
  data.value = res.data
  total.value = res.len
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
  getList(1, num.value)
})

window.addEventListener('resize', () => {
  changeDate()
  getList(1, num.value)
})

// 分页后再次调接口(后端分页)
var page = 1
const num = ref()
const onPageChange = (index) => {
  page = index
  getList(page, num.value)
  checkedRows.value = []
}

//add弹窗与文件上传逻辑
const isModalActive = ref(false)
const dropFiles = ref([])
var addCount = 0
const imgCheck = () => {
  for (const item of dropFiles.value) {
    if (item.type !== 'image/png' && item.type !== 'image/jpeg') {
      instance.proxy.$buefy.toast.open({
        message: 'Please upload images in PNG/JPEG format',
        type: 'is-danger'
      })
      return false
    }
  }
  return true
}
const fileGo = () => {
  let time
  if (time) clearTimeout(time)
  time = setTimeout(() => {
    if (imgCheck()) {
      dropFiles.value.forEach((item) => {
        uploadFile(item)
      })
    }
  }, 300)
}

const uploadFile = async (item) => {
  const formData = new FormData()
  formData.append('file', item)
  await putImg(formData)
  if (++addCount === dropFiles.value.length) {
    instance.proxy.$buefy.toast.open({
      message: 'Upload success!',
      type: 'is-success'
    })
    getList(page, num.value)
    addCount = 0
  }
}

//del逻辑
const checkedRows = ref([])
const instance = getCurrentInstance()
var delCount = 0
const delAdmit = () => {
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to delete?',
    canCancel: ['button'],
    onConfirm: async () => {
      checkedRows.value.forEach((item) => {
        delPro(item.name)
      })
    }
  })
}
const delPro = async (url) => {
  await delImg({ url })
  if (++delCount === checkedRows.value.length) {
    getList(page, num.value)
    checkedRows.value = []
    delCount = 0
  }
}
</script>

<template>
  <div class="rcMain">
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
        v-model:checked-rows="checkedRows"
        checkable
      >
        <div class="rcMain-table-action">
          <button class="rcMain-table-action-add" @click="isModalActive = true">
            ADD
          </button>

          <b-modal v-model="isModalActive" has-modal-card :canCancel="['x']">
            <b-field class="card">
              <b-upload
                v-model="dropFiles"
                multiple
                drag-drop
                expanded
                native
                name="file"
                style="padding: 30px"
                @input="fileGo()"
              >
                <section class="section" @drop="fileGo()">
                  <div class="content has-text-centered">
                    <p>
                      <b-icon icon="upload" size="is-large"> </b-icon>
                    </p>
                    <p>Drop your images here or click to upload</p>
                  </div>
                </section>
              </b-upload>
            </b-field>
          </b-modal>

          <button
            class="rcMain-table-action-del"
            v-show="checkedRows.length !== 0"
            @click="delAdmit()"
          >
            DELETE
          </button>
        </div>

        <b-table-column field="name" label="Name" width="200" centered>
          <template v-slot="props">
            {{ props.row.name.split('.')[0] }}
          </template>
        </b-table-column>

        <b-table-column
          field="time"
          label="Added date"
          width="200"
          centered
          sortable
        >
          <template v-slot="props">
            {{ dayjs(props.row.time).format('YYYY-MM-DD HH:mm') }}
          </template>
        </b-table-column>

        <b-table-column field="size" label="Size" width="100" centered>
          <template v-slot="props"> {{ props.row.size }}MB </template>
        </b-table-column>

        <b-table-column field="kind" label="Kind" width="50" centered>
          <template v-slot="props">
            {{ props.row.name.split('.')[1] }}
          </template>
        </b-table-column>

        <b-table-column field="kind" label="URL" width="300" centered>
          <template v-slot="props">
            <a :href="props.row.url" target="_blank"
              >{{ props.row.url.slice(33) }}
            </a></template
          >
        </b-table-column>

        <template #empty>
          <div class="has-text-centered">No records</div>
        </template>

        <div class="rcMain-table-total" v-show="checkedRows.length !== 0">
          <b>Total checked:</b>
          {{ checkedRows.length }}
        </div>
      </b-table>
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

  &-table {
    position: absolute;
    top: 72px;
    width: 90%;

    &-action {
      position: absolute;
      top: -56px;
      width: 200px;
      height: 40px;
      display: flex;

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
        margin-right: 20px;
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
  }
}
</style>
