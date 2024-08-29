<script setup>
import { ref, watch, onMounted, getCurrentInstance } from 'vue'
import { getCategoryType } from '@/api/project'
import {
  getProduct,
  changeStatus,
  addProduct,
  addCategoryType,
  getSku
} from '@/api/product'
import { getRule, addRuleToSpu } from '@/api/rule.js'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import example from '@/assets/files/example.xlsx'
import attribute_example from '@/assets/files/attribute_example.png'
import { ToastProgrammatic as Toast } from 'buefy'
import check from '@/utils/commonJs/excelCheck.js'
import { useUserStore } from '@/stores/counter'

//获取用户数据
const userStore = useUserStore()

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

//获取Project列表
const data = ref()
const num = ref(8)
const total = ref()
const getList = async () => {
  var category_id
  for (const key in type.value) {
    if (type.value[key] === selectedCategory.value) {
      category_id = key
    }
  }
  const res = await getProduct({
    offset,
    count: num.value,
    name: searchName.value,
    category_id,
    sale_status: selectedStatus.value === 'None' ? null : selectedStatus.value
  })
  data.value = res.spu_list
  total.value = res.spu_count
}

const type = ref()
const getType = async () => {
  const res = await getCategoryType()
  type.value = res
}

var skuList
const getSkuList = async () => {
  const res = await getSku()
  skuList = res.sku_list
}

const instance = getCurrentInstance()

//name筛选
const searchName = ref()
const search = () => {
  getList()
}
const cancelSearch = () => {
  searchName.value = ''
  getList()
}

//category筛选
const selectedCategory = ref()
watch(selectedCategory, (newVal) => {
  if (newVal === 'None') {
    getList()
  } else {
    getList()
  }
})

//status筛选
const selectedStatus = ref()
watch(selectedStatus, (newVal) => {
  if (newVal === 'None') {
    getList()
  } else {
    getList()
  }
})

//响应式逻辑
const tabelHeight = ref()
const changeDate = () => {
  if (document.body.clientWidth <= 1600) {
    tabelHeight.value = '62vh'
  } else {
    tabelHeight.value = '70vh'
  }
}

onMounted(() => {
  changeDate()
  getType()
  getList()
  getSkuList()
  getRuleList()
})

window.addEventListener('resize', () => {
  changeDate()
})

//分页后再次调接口(后端分页)
var offset = 0
const onPageChange = (page) => {
  offset = (page - 1) * num.value
  getList()
}

//子传父，完成页面转换
// const emit = defineEmits(['changeBlock'])
// const handleEmit = (index, mode, data) => {
//   emit('changeBlock', index, mode, data) //value是传给父元素事件的参数
// }
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

//export(axios乱码只能用fetch了qaq)
const exportFile = () => {
  var xlsxList = []
  data.value.forEach((item) => {
    xlsxList.push({
      ProductName: item.name,
      Sku: item.code,
      Type: 'Ready to wear',
      Category: type.value[item.category_id],
      Description: item.description,
      Images: item.image_path_list,
      StandardPrice: item.standard_price,
      SalePrice: item.sale_price,
      Variation: getTheSku(item.id),
      SizeChart: item.size_chart,
      ruleName: item.rule_name
    })
  })
  fetch('http://localhost:8000/json2excel', {
    method: 'POST', //post请求
    body: JSON.stringify(xlsxList),
    headers: {
      Accept: 'application/json',
      responseType: 'arraybuffer',
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.blob())
    .then((data) => {
      const downloadURL = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = downloadURL
      a.download = 'fileName'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadURL)
    })
}
const getTheSku = (id) => {
  var data = []
  skuList.forEach((item) => {
    if (item.spu_id === id) {
      data.push({
        sku: item.code,
        material: item.materials,
        size: item.size,
        color: item.color
      })
    }
  })
  return data
}

//excel导入
const isModalActive = ref(false)
const isDialogModalActive = ref(false)
const dialog = ref()
var excelLength = 0
var count = 0
const getExcel = (e) => {
  var selectedFile = e.target.files[0]
  var reader = new FileReader()
  reader.onload = function (event) {
    var data = event.target.result
    var workbook = XLSX.read(data, {
      type: 'binary'
    })
    workbook.SheetNames.forEach(function (sheetName) {
      var XL_row_object = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheetName]
      )
      if (XL_row_object.length > 0 && !('__EMPTY' in XL_row_object[0])) {
        check(XL_row_object).then((res) => {
          dialog.value = Array.from(res)
          if (Object.keys(dialog.value).length === 0) {
            excelLength = XL_row_object.length
            XL_row_object.forEach((item) => {
              isNew(item)
            })
          } else {
            isModalActive.value = false
            isDialogModalActive.value = true
          }
        })
      } else {
        instance.proxy.$buefy.toast.open({
          message: 'The table you import is empty!',
          type: 'is-danger',
          duration: 5000
        })
      }
    })
  }
  reader.onerror = function (event) {
    console.error('File could not be read! Code ' + event.target.error.code)
  }
  // 读取上传文件为二进制
  reader.readAsBinaryString(selectedFile)
}

const download = async () => {
  await fetch(example)
    .then((response) => response.blob())
    .then((blob) => {
      saveAs(blob, 'example.xlsx')
    })
    .catch((error) => {
      console.error('Error fetching file:', error)
    })
  await fetch(attribute_example)
    .then((response) => response.blob())
    .then((blob) => {
      saveAs(blob, 'attribute_example.png')
    })
    .catch((error) => {
      console.error('Error fetching file:', error)
    })
}

//添加请求

//验证是否为新的Category
const isNew = (parm) => {
  if (checkNew(parm.Category)) {
    createNew(parm)
  } else {
    add(parm, 1)
  }
}

const checkNew = (category) => {
  for (const key in type.value) {
    if (type.value[key].toLowerCase() === category.toLowerCase()) return false
  }
  return true
}

//创建新的Category
const createNew = async (parm) => {
  const res = await addCategoryType(parm.Category)
  add(parm, 2, res.last_row_id)
}

//Category-id转换
const typeToId = (t) => {
  for (const key in type.value) {
    if (type.value[key] === t) return key
  }
}
const add = async (parm, index, cateId) => {
  var des = ''
  if (Object.hasOwnProperty.call(parm, 'Description')) {
    des = parm.Description
  }
  var variationList = []
  JSON.parse(parm.Variation.replace(/\s/g, '')).forEach((item) => {
    variationList.push({
      id: null,
      code: item.Sku,
      spu_id: null,
      material: item.material,
      size: item.size,
      color: item.color
    })
  })

  // console.log({
  //   id: null,
  //   code: parm.Sku.toString(),
  //   type: true,
  //   category_id: typeToId(parm.Category),
  //   name: parm.ProductName,
  //   description: des,
  //   image_path_list: JSON.parse(parm.Images.replace(/\s/g, '')),
  //   size_chart: JSON.parse(parm.SizeChart.replace(/\s/g, '')),
  //   pattern_path: '',
  //   standard_price: parm.StandardPrice,
  //   sale_price: parm.SalePrice,
  //   created_time: null,
  //   modified_time: null,
  //   sku_list: variationList,
  //   rule_name: parm.ruleName
  // })
  try {
    const res = await addProduct({
      id: null,
      code: parm.Sku.toString(),
      type: true,
      category_id: index === 1 ? typeToId(parm.Category) : cateId,
      name: parm.ProductName.toString(),
      description: des,
      image_path_list: JSON.parse(parm.Images.replace(/\s/g, '')),
      size_chart: JSON.parse(parm.SizeChart.replace(/\s/g, '')),
      pattern_path: '',
      standard_price: parm.StandardPrice,
      sale_price: parm.SalePrice,
      created_time: null,
      modified_time: null,
      sku_list: variationList,
      rule_name: parm.ruleName
    })
    addRule(res.product_id, parm.ruleName)
  } catch (err) {
    console.log(err)
  }
}

//rule
const ruleList = ref()
const getRuleList = async () => {
  const res = await getRule(1, 100)
  ruleList.value = res.data
}
const addRule = async (id, name) => {
  const selectRule = ruleList.value.filter((item) => item.name === name)[0]
  await addRuleToSpu(
    id,
    JSON.parse(selectRule.screen_rule),
    JSON.parse(selectRule.size_code_to_name)
  )
  if (++count === excelLength) {
    Toast.open({
      type: 'is-success',
      message: 'Add success!',
      duration: 5000
    })
    getType()
    getList()
    isModalActive.value = false
    count = 0
  }
}

const dataGroup = (parm) => {
  const getTheSku = (id) => {
    var data = []
    skuList.forEach((item) => {
      if (item.spu_id === id) {
        data.push(item)
      }
    })
    return data
  }
  return {
    ...parm,
    sku_list: getTheSku(parm.id)
  }
}

const changeSale_status = (id, status) => {
  instance.proxy.$buefy.dialog.confirm({
    message:
      status === 'active'
        ? 'Setting the product status to archive will prevent customers from viewing this product. Are you sure you want to proceed with this operation?'
        : 'Setting the product status to active will make the product available for sale again. Are you sure you want to proceed with this operation?',
    canCancel: ['button'],
    onConfirm: async () => {
      getChange(id, status)
    },
    onCancel: () => {
      getList()
    }
  })
}
const getChange = async (id, status) => {
  await changeStatus({
    sale_status: status === 'active' ? 'archive' : 'active',
    spu_id: id
  })
}
</script>

<template>
  <div class="rcMain">
    <input
      class="rcMain-input"
      placeholder="Search product"
      id="input"
      v-model="searchName"
      @keyup.enter="search()"
      autocomplete="off"
    />
    <b-icon icon="close-circle" @click="cancelSearch()" id="icon"></b-icon>

    <button class="rcMain-button" @click="changeTab($event)"></button>

    <div class="rcMain-form" id="form">
      <b-field class="rcMain-form-select">
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

      <b-field class="rcMain-form-status">
        <b-select
          placeholder="Status"
          v-model="selectedStatus"
          style="border: 1px solid #d1caf2"
        >
          <option value="None">None</option>
          <option value="active">active</option>
          <option value="archive">archive</option>
        </b-select></b-field
      >
    </div>

    <b-field class="rcMain-table">
      <b-table
        :data="data"
        :mobile-cards="false"
        :paginated="true"
        :per-page="num"
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
        @page-change="onPageChange"
        :total="total"
        backend-pagination
      >
        <div class="rcMain-table-port">
          <button
            class="rcMain-table-port-add"
            @click="$emit('changeBlock', 1, 0)"
            v-if="userStore.profileInfo.auth_list.includes('Product_edit')"
          >
            ADD
          </button>
          <button class="rcMain-table-port-export" @click="exportFile()">
            EXPORT
          </button>
          <button
            class="rcMain-table-port-import"
            @click="isModalActive = true"
            v-if="userStore.profileInfo.auth_list.includes('Product_edit')"
          >
            IMPORT
          </button>

          <!-- import -->
          <b-modal
            v-model="isModalActive"
            has-modal-card
            :canCancel="['button']"
          >
            <b-field class="modal-card" style="width: auto">
              <header class="modal-card-head">
                <p class="modal-card-head-title">IMPORT</p>
                <button
                  type="button"
                  class="delete"
                  @click="isModalActive = false"
                />
              </header>
              <section class="modal-card-body">
                <p class="modal-card-body-title">
                  You can create products in batches by importing an excel sheet
                  <br />
                  ● Description is <b style="color: #27678c">optional</b>
                  <br />
                  ● Images'url should be existing in
                  <b style="color: #27678c">media management</b>, if not, please
                  upload them in media management first
                  <br />
                  ● Size chart's attribute needs to be consistent with what is
                  given <b style="color: #27678c">in example</b>
                </p>
                <div class="modal-card-body-action">
                  <b-button
                    type="is-info"
                    @click="download()"
                    style="margin-right: 40px"
                    >Example</b-button
                  >
                  <b-upload @change="getExcel($event)" class="file-label">
                    <span class="file-cta" style="background-color: #7957d5">
                      <span
                        class="file-label"
                        style="font-weight: 600; color: white"
                        >Import</span
                      >
                    </span>
                  </b-upload>
                </div>
              </section>
            </b-field>
          </b-modal>

          <!-- wrong_dialog -->
          <b-modal
            v-model="isDialogModalActive"
            has-modal-card
            :canCancel="['button']"
          >
            <b-field class="modal-card" style="width: auto">
              <header class="modal-card-head" style="background-color: #ea6e5d">
                <p class="modal-card-head-title">Error</p>
                <button
                  type="button"
                  class="delete"
                  @click="isDialogModalActive = false"
                />
              </header>
              <section class="modal-card-body">
                <div class="modal-card-body-list">
                  <div v-for="(item, index) in dialog" :key="index">
                    ● {{ item }} <br />
                  </div>
                </div>
                <div class="modal-card-body-action">
                  <b-button
                    @click="
                      // eslint-disable-next-line prettier/prettier
                      isDialogModalActive = false;
                      isModalActive = true
                    "
                    type="is-primary"
                    >Reimport
                  </b-button>
                </div>
              </section>
            </b-field>
          </b-modal>
        </div>

        <b-table-column field="image" width="120" centered>
          <template v-slot="props">
            <img
              :src="
                'https://info.cafilab.com/spu_img/' +
                unicode2Ch(props.row.image_path_list[0])
              "
            />
          </template>
        </b-table-column>

        <b-table-column field="name" label="Product name" width="150" centered>
          <template v-slot="props">
            {{ props.row.name }}
          </template>
        </b-table-column>

        <b-table-column field="category" label="Category" width="150" centered>
          <template v-slot="props">
            {{ type[props.row.category_id] }}
          </template>
        </b-table-column>

        <b-table-column
          field="standard_price"
          label="Standard price"
          width="150"
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
          width="150"
          centered
          sortable
        >
          <template v-slot="props">
            {{ props.row.sale_price }}
          </template>
        </b-table-column>

        <b-table-column
          field="description"
          label="Description"
          width="150"
          centered
          sortable
        >
          <template v-slot="props">
            {{ props.row.description }}
          </template>
        </b-table-column>

        <b-table-column
          field="action"
          width="100"
          centered
          v-if="userStore.profileInfo.auth_list.includes('Product_edit')"
        >
          <template v-slot="props">
            <span
              class="tag edit"
              @click="$emit('changeBlock', 1, 1, dataGroup(props.row))"
            >
              Edit
            </span>
          </template>
        </b-table-column>

        <b-table-column
          width="140"
          centered
          v-slot="props"
          v-if="userStore.profileInfo.auth_list.includes('Product_edit')"
        >
          <b-switch
            v-model="props.row.status"
            true-value="active"
            false-value="hidden"
            :rounded="false"
            passive-type="is-dark"
            @click="changeSale_status(props.row.id, props.row.status)"
          >
            {{ props.row.status }}
          </b-switch>
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
::v-deep .has-addons {
  flex-direction: column;
}
.modal-card {
  border-radius: 5px;

  &-head {
    background-color: #7957d5;
    display: flex;
    justify-content: space-between;

    &-title {
      font-size: 24px;
      color: $light;
      font-weight: 600;
    }
  }

  &-body {
    width: 600px;
    min-height: 240px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;

    &-action {
      display: flex;
      justify-content: end;
    }

    &-list {
      margin-bottom: 20px;
      max-height: 400px;
      overflow-y: auto;
    }
  }

  ::v-deep .pagination {
    flex-wrap: nowrap;
  }
}

@media (min-width: 1120px) {
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

      &-select {
        height: 40px;
        margin-right: 20px;
      }

      &-status {
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

    &-table {
      position: absolute;
      top: 72px;
      width: 90%;

      &-port {
        position: absolute;
        top: -56px;
        right: 0;
        width: auto;
        height: 40px;
        display: flex;
        justify-content: end;

        button {
          width: 80px;
          height: 100%;
          font-weight: 600;
          border-radius: 5px;
          color: $light;
        }

        &-add {
          background-color: #7957d5;
          margin-left: 20px;
        }

        &-export {
          background-color: $tertiary;
          margin-left: 20px;
        }

        &-import {
          background-color: $tertiary;
          margin-left: 20px;
        }
      }

      &-total {
        position: absolute;
        bottom: 0;
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

@media (max-width: 1120px) {
  ::v-deep .table thead > tr {
    font-size: 16px;

    & > td {
      vertical-align: middle;
    }
  }

  ::v-deep .table tbody > tr {
    font-size: 16px;

    & > td {
      padding: 0;
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

      &-select {
        height: 40px;
        margin-right: 20px;
      }

      &-status {
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

    &-table {
      position: absolute;
      top: 72px;
      width: 90%;

      &-port {
        position: absolute;
        top: -56px;
        right: 0;
        width: auto;
        height: 40px;
        display: flex;
        justify-content: end;

        button {
          width: 80px;
          height: 100%;
          font-weight: 600;
          border-radius: 5px;
          color: $light;
        }

        &-add {
          background-color: #7957d5;
        }

        &-export {
          background-color: $tertiary;
          margin-left: 20px;
        }

        &-import {
          background-color: $tertiary;
          margin-left: 20px;
        }
      }

      &-total {
        position: absolute;
        bottom: -6%;
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

<style>
@keyframes leftmove {
  0% {
    left: 380px;
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
