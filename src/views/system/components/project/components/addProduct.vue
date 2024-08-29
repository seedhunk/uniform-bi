<script setup>
import { defineProps, ref, onMounted, getCurrentInstance } from 'vue'
import {
  getProductList,
  getCategoryType,
  getProject,
  addProductToSub
} from '@/api/project'

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  mode: {
    type: Number
  },
  data: {
    type: Object
  },
  sub_Data: {
    type: Object
  }
})

const spuData = ref()
const spuAllData = ref()
const getList = async () => {
  const res = await getProductList()
  spuData.value = res
  spuAllData.value = res
}

const alreadySelected = ref([])
const getSpu = async () => {
  const res = await getProject(props.sub_Data.id)
  res.spu_list.forEach((item) => {
    alreadySelected.value.push(item.id)
  })
}

const type = ref()
const getType = async () => {
  const res = await getCategoryType()
  type.value = res
}
onMounted(() => {
  getList()
  getType()
  getSpu()
})

//name筛选
const searchName = ref()
const search = () => {
  spuData.value = spuAllData.value.filter((item) =>
    item.name.includes(searchName.value)
  )
}
const cancelSearch = () => {
  spuData.value = spuAllData.value
  searchName.value = ''
}

//add
const emit = defineEmits(['changeBlock'])
const instance = getCurrentInstance()
const checkedRows = ref([])
const selectList = ref([])
const addProduct = () => {
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to add?',
    canCancel: ['button'],
    onConfirm: async () => {
      checkedRows.value.forEach((item) => {
        selectList.value.push(item.id)
      })
      await addProductToSub({
        project_id_list: [props.sub_Data.id],
        product_id_list: selectList.value
      })
      emit('changeBlock', 1, 1, props.data, props.sub_Data)
    }
  })
}

//unicode转码
const unicode2Ch = (str) => {
  if (!str) {
    return
  }
  // 控制循环跃迁
  var len = 1
  var result = ''
  // 注意，这里循环变量的变化是i=i+len 了
  for (var i = 0; i < str.length; i = i + len) {
    len = 1
    var temp = str.charAt(i)
    if (temp == '\\') {
      // 找到形如 \u 的字符序列
      if (str.charAt(i + 1) == 'u') {
        // 提取从i+2开始(包括)的 四个字符
        var unicode = str.substr(i + 2, 4)
        // 以16进制为基数解析unicode字符串，得到一个10进制的数字
        result += String.fromCharCode(parseInt(unicode, 16).toString(10))
        // 提取这个unicode经过了5个字符， 去掉这5次循环
        len = 6
      } else {
        result += temp
      }
    } else {
      result += temp
    }
  }
  return result
}
</script>

<template>
  <div class="rcMain">
    <button
      class="rcMain-back"
      @click="$emit('changeBlock', 1, 1, data, sub_Data)"
    >
      BACK
    </button>
    <button class="rcMain-add" @click="addProduct()">
      {{ mode === 1 ? 'MODIFY' : 'ADD' }}
    </button>
    <div class="rcMain-main">
      <div class="rcMain-main-title">Add products to {{ sub_Data.name }}</div>
      <div class="rcMain-main-line"></div>
      <section class="rcMain-main-detail">
        <input
          class="rcMain-main-detail-input"
          placeholder="Name Search"
          v-model="searchName"
          @keyup.enter="search()"
        />
        <b-icon icon="close-circle" @click="cancelSearch()"></b-icon>
        <b-field class="rcMain-main-detail-table">
          <b-table
            :data="spuData"
            :mobile-cards="false"
            :paginated="true"
            :per-page="8"
            :sticky-header="true"
            height="420px"
            v-model:checked-rows="checkedRows"
            checkable
            :is-row-checkable="(row) => alreadySelected.indexOf(row.id) === -1"
          >
            <b-table-column field="image" width="50" centered>
              <template v-slot="props">
                <img
                  :src="
                    'https://info.cafilab.com/spu_img/' +
                    unicode2Ch(JSON.parse(props.row.image_path_list)[0])
                  "
                />
              </template>
            </b-table-column>

            <b-table-column
              field="name"
              label="Product name"
              width="250"
              centered
            >
              <template v-slot="props">
                {{ props.row.name }}
              </template>
            </b-table-column>

            <b-table-column
              field="category"
              label="Category"
              width="250"
              centered
            >
              <template v-slot="props">
                {{ type[props.row.category_id] }}
              </template>
            </b-table-column>

            <template #empty>
              <div class="has-text-centered">No records</div>
            </template>
          </b-table>
        </b-field>
      </section>
    </div>
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
  padding: 56px 60px;
  position: relative;

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

  &-main {
    box-shadow: 2px 10px 15px rgba(0, 0, 0, 0.25);
    height: 100%;
    width: 100%;
    background-color: $light;

    &-title {
      padding: 2% 5%;
      height: 10%;
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
      position: relative;
      padding: 2% 5%;
      width: 100%;
      height: 90%;
      font-size: 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      &-input {
        width: 100%;
        height: 8%;
        border: 1px solid $primary;
        margin-bottom: 24px;
        border-radius: 5px;
        text-indent: 10px;
        color: $black;
        font-size: 16px;

        &:focus {
          outline: 1px solid $primary;
        }
      }

      .icon {
        position: absolute;
        top: 34px;
        right: 70px;
        opacity: 0.25;
        cursor: pointer;
      }

      &-table {
        width: 100%;
        height: 90%;
      }
    }
  }
}
</style>
