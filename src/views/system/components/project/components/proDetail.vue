<script setup>
import { ref, defineProps, onMounted, watch, getCurrentInstance } from 'vue'
import { getProject, getCategoryType, delProductToSub } from '@/api/project'
import subList from './subList.vue'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()
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

const checkedRows = ref([])
const subData = ref([])
const subTotal = ref()
const defaultName = ref()
const getSubList = async (id) => {
  const res = await getProject(id)
  subData.value = res.sub_project_list
  subTotal.value = res.sub_project_count
  if (res.sub_project_list.length !== 0) {
    if (props.sub_Data) {
      selectedSub.value = props.sub_Data.id
    } else {
      selectedSub.value = res.sub_project_list[0].id
    }
    defaultName.value = res.sub_project_list[0].name
  } else {
    defaultName.value = null
    spuData.value = []
    spuTotal.value = 0
  }
}

const spuData = ref([])
const spuTotal = ref()
const getSpuList = async (id) => {
  var category_id
  for (const key in type.value) {
    if (type.value[key] === selectedCategory.value) {
      category_id = key
    }
  }
  const res = await getProject(id, {
    offset,
    count: num.value,
    name: searchName.value,
    category_id
  })
  spuData.value = res.spu_list
  spuTotal.value = res.spu_count
}

//分页后再次调接口(后端分页)
var offset = 0
const onPageChange = (page) => {
  offset = (page - 1) * num.value
  getSpuList(selectedSub.value)
  checkedRows.value = []
}

const type = ref()
const getType = async () => {
  const res = await getCategoryType()
  type.value = res
}

const num = ref()
const tabelHeight = ref()
const changeDate = () => {
  if (document.body.clientWidth <= 1600) {
    tabelHeight.value = '50vh'
    num.value = 7
  } else if (document.body.clientWidth <= 872) {
    num.value = 6
  } else {
    num.value = 8
    tabelHeight.value = '52vh'
  }
}

onMounted(() => {
  changeDate()
  getSubList(props.data.id)
  getType()
})

window.addEventListener('resize', () => {
  changeDate()
})

//子传父切换组件页面
const emit = defineEmits(['changeBlock'])
const handleEmit = (index, mode, data, subData) => {
  emit('changeBlock', index, mode, data, subData) //value是传给父元素事件的参数
}

//子项目筛选
const selectedSub = ref()
watch(selectedSub, (newVal) => {
  getSpuList(newVal)
})

//弹窗显示状态
const isComponentModalActive = ref(false)

//name筛选
const searchName = ref()
const search = () => {
  getSpuList(selectedSub.value)
}
const cancelSearch = () => {
  searchName.value = ''
  getSpuList(selectedSub.value)
}

//category筛选
const selectedCategory = ref()
watch(selectedCategory, (newVal) => {
  if (newVal === 'None') {
    getSpuList(selectedSub.value)
  } else {
    for (const key in type.value) {
      if (type.value[key] === newVal) {
        getSpuList(selectedSub.value)
      }
    }
  }
})

//删除product
const instance = getCurrentInstance()
const del = () => {
  var project_id_list = [selectedSub.value]
  var product_id_list = []
  checkedRows.value.forEach((item) => {
    product_id_list.push(item.id)
  })
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to delete?',
    canCancel: ['button'],
    onConfirm: async () => {
      await delProductToSub({ project_id_list, product_id_list })
      checkedRows.value = []
      getSpuList(selectedSub.value)
    }
  })
}
</script>

<template>
  <div class="rcMain">
    <div class="rcMain-header">
      <div class="rcMain-header-detail">
        <div class="rcMain-header-detail-name">
          <p>{{ data.name }}</p>
          <p style="text-decoration: underline">
            {{
              data.encryption === ''
                ? '(public project)'
                : '(encryption code: ' + data.encryption + ')'
            }}
          </p>
        </div>
        <p class="rcMain-header-detail-des">
          Description: {{ data.description || 'No Description' }}
        </p>
        <div
          class="rcMain-header-detail-sub"
          @click="isComponentModalActive = true"
        >
          {{ subTotal || 0 }} sub-projects
        </div>
        <b-modal
          v-model="isComponentModalActive"
          has-modal-card
          :canCancel="['button']"
          @close="getSubList(data.id)"
        >
          <template #default="props">
            <subList :id="data.id" @close="props.close"></subList>
          </template>
        </b-modal>
      </div>
      <div class="rcMain-header-action">
        <b-select
          v-model="selectedSub"
          style="border: 1px solid #d1caf2"
          placeholder="Please add a sub-project before adding product"
          :disabled="!defaultName"
        >
          <option
            :value="item.id"
            v-for="(item, index) in subData"
            :key="index"
          >
            {{ item.name }}
          </option>
        </b-select>

        <b-dropdown
          aria-role="list"
          v-if="userStore.profileInfo.auth_list.includes('Project_edit')"
        >
          <template #trigger="{ active }">
            <b-button
              label="ADD"
              type="is-primary"
              :icon-right="active ? 'menu-up' : 'menu-down'"
            />
          </template>

          <b-dropdown-item
            aria-role="listitem"
            v-if="defaultName"
            @click="
              handleEmit(
                2,
                0,
                data,
                ...subData.filter((item) => item.id === selectedSub)
              )
            "
            >Add product to this sub project</b-dropdown-item
          >
          <b-dropdown-item aria-role="listitem" @click="handleEmit(0, 2, data)"
            >Add subproject</b-dropdown-item
          >
        </b-dropdown>
      </div>
    </div>
    <b-field class="rcMain-table">
      <input
        class="rcMain-table-input"
        placeholder="Search product"
        v-model="searchName"
        @keyup.enter="search()"
        autocomplete="off"
      />
      <b-icon icon="close-circle" @click="cancelSearch()"></b-icon>

      <b-field class="rcMain-table-select">
        <b-select
          placeholder="Category"
          v-model="selectedCategory"
          style="border: 1px solid #d1caf2"
        >
          <option value="None">None</option>
          <option v-for="(item, index) in type" :key="index" :value="item">
            {{ item }}
          </option>
        </b-select></b-field
      >

      <button
        class="rcMain-table-del"
        v-show="checkedRows.length !== 0"
        @click="del()"
      >
        DELETE
      </button>

      <b-table
        :data="spuData"
        :mobile-cards="false"
        :paginated="true"
        :per-page="num"
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
        v-model:checked-rows="checkedRows"
        :checkable="userStore.profileInfo.auth_list.includes('Project_edit')"
        @page-change="onPageChange"
        :total="spuTotal"
        backend-pagination
      >
        <b-table-column field="image" width="100" centered>
          <template v-slot="props">
            <img
              :src="
                'https://info.cafilab.com/spu_img/' +
                JSON.parse(props.row.image_path_list)[0]
              "
            />
          </template>
        </b-table-column>

        <b-table-column field="name" label="Product name" width="300" centered>
          <template v-slot="props">
            {{ props.row.name }}
          </template>
        </b-table-column>

        <b-table-column field="category" label="Category" width="300" centered>
          <template v-slot="props">
            {{ type[props.row.category_id] }}
          </template>
        </b-table-column>

        <b-table-column
          field="standard_price"
          label="Standard price"
          width="240"
          centered
          sortable
        >
          <template v-slot="props">
            {{ props.row.standard_price }}
          </template>
        </b-table-column>

        <b-table-column
          field="sale_price"
          label="Sale price"
          width="240"
          centered
          sortable
        >
          <template v-slot="props">
            {{ props.row.sale_price }}
          </template>
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

@media (min-width: 1024px) {
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
    padding: 36px 60px 0px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    &-header {
      height: auto;
      display: flex;
      flex-direction: column;
      padding-bottom: 72px;

      &-detail {
        position: relative;

        &-name {
          display: flex;
          margin-bottom: 12px;

          p:nth-child(1) {
            font-size: 48px;
            line-height: 0;
            font-weight: 600;
            margin-right: 12px;
          }
        }

        &-des {
          color: $grey;
        }

        &-sub {
          position: absolute;
          top: 0;
          right: 0;
          text-decoration: underline;
          cursor: pointer;
        }
      }

      &-action {
        display: flex;
        margin-top: 16px;

        &-select {
          border: 1px solid $primary;
        }

        .button {
          margin-left: 16px;
        }
      }
    }

    &-table {
      width: 100%;
      padding-bottom: 16px;
      position: relative;

      &-input {
        position: absolute;
        top: -56px;
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
        top: -48px;
        opacity: 0.25;
        left: 270px;
        cursor: pointer;
      }

      &-button {
        position: absolute;
        top: -56px;
        left: 320px;
        width: 40px;
        height: 40px;
        background-image: url('@/assets/images/Vector.png');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        border-radius: 10px;
      }

      &-select {
        position: absolute;
        top: -56px;
        left: 320px;
        height: 40px;
        margin-right: 20px;
      }

      &-del {
        position: absolute;
        top: -56px;
        right: 0;
        width: 80px;
        height: 40px;
        color: $light;
        font-weight: 600;
        border-radius: 5px;
        border: 1px solid $danger;
        background-color: $danger;
      }

      &-total {
        position: absolute;
        bottom: 16px;
        font-size: 20px;
      }
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

@media (max-width: 1024px) {
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
    padding: 36px 60px 0px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    &-header {
      height: auto;
      display: flex;
      flex-direction: column;
      padding-bottom: 72px;

      &-detail {
        position: relative;

        &-name {
          display: flex;
          margin-bottom: 6px;

          p:nth-child(1) {
            font-size: 40px;
            line-height: 0;
            font-weight: 600;
            margin-right: 12px;
          }
        }

        &-des {
          color: $grey;
        }

        &-sub {
          position: absolute;
          top: 0;
          right: 0;
          text-decoration: underline;
          cursor: pointer;
        }
      }

      &-action {
        display: flex;
        margin-top: 16px;

        &-select {
          border: 1px solid $primary;
        }

        .button {
          margin-left: 16px;
        }
      }
    }

    &-table {
      width: 100%;
      padding-bottom: 16px;
      position: relative;

      &-input {
        position: absolute;
        top: -56px;
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
        top: -48px;
        opacity: 0.25;
        left: 270px;
        cursor: pointer;
      }
      &-button {
        position: absolute;
        top: -56px;
        left: 320px;
        width: 40px;
        height: 40px;
        background-image: url('@/assets/images/Vector.png');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        border-radius: 10px;
      }

      &-select {
        position: absolute;
        top: -56px;
        left: 320px;
        height: 40px;
        margin-right: 20px;
      }

      &-del {
        position: absolute;
        top: -56px;
        right: 0;
        width: 80px;
        height: 40px;
        color: $light;
        font-weight: 600;
        border-radius: 5px;
        border: 1px solid $danger;
        background-color: $danger;
      }

      &-total {
        position: absolute;
        bottom: 16px;
        font-size: 20px;
      }
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
</style>
