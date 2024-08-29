<script setup>
import { defineProps, ref, getCurrentInstance, watch, onMounted } from 'vue'
import { getCategoryType } from '@/api/project'
import {
  addProduct,
  addCategoryType,
  delProduct,
  isok_del
} from '@/api/product'
import { putImg } from '@/api/media.js'
import { getRule, addRuleToSpu } from '@/api/rule.js'
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
  }
})
const isImageModalActive = ref(false)
const instance = getCurrentInstance()
const emit = defineEmits(['changeBlock'])
//表单收集数据——product info
const proName = ref(props.mode === 1 ? props.data.name : '')
const sku = ref(props.mode === 1 ? props.data.code : '')
//更新sub-sku联动
watch(sku, (newVal, oldVal) => {
  if (newVal !== '') {
    skuCount = 0
    variationList.value.forEach((item) => {
      //仅更新默认，自定义的就不管
      if (item.variantSku == oldVal + '-' + skuCount || oldVal === '') {
        item.variantSku = newVal + '-' + skuCount++
      } else {
        skuCount++
      }
    })
  } else {
    skuCount = 0
    variationList.value.forEach((item) => {
      item.variantSku = skuCount++
    })
  }
})
const type = ref(props.mode === 1 ? 'wear' : null)
const category = ref()
const des = ref(props.mode === 1 ? props.data.description : '')
//请求Category类型
const categoryList = ref()
const getType = async () => {
  const res = await getCategoryType()
  categoryList.value = res
  if (props.mode === 1)
    category.value = categoryList.value[props.data.category_id]
}
//Category-id转换
const typeToId = (type) => {
  for (const key in categoryList.value) {
    if (categoryList.value[key] === type) return key
  }
}
//Category选择动画
const modeType = ref(props.mode === 1 ? 1 : null)
const categoryAni_add = (index, type) => {
  var select = document.getElementById('select')
  var mode = document.getElementById('mode')
  if (index === 1) {
    modeType.value = type
    select.style.animationName = 'gone'
    select.style.animationDuration = '0.6s'
    select.style.animationFillMode = 'forwards'

    mode.style.animationName = 'show'
    mode.style.animationDuration = '0.6s'
    mode.style.animationFillMode = 'forwards'
  } else {
    select.style.animationName = 'show'
    select.style.animationDuration = '0.6s'
    select.style.animationFillMode = 'forwards'

    mode.style.animationName = 'gone'
    mode.style.animationDuration = '0.6s'
    mode.style.animationFillMode = 'forwards'

    //切换了把预填数据清空
    category.value = null
  }
}
const categoryAni_edit = (index, type) => {
  var select = document.getElementById('select_edit')
  var mode = document.getElementById('mode_edit')
  if (index === 1) {
    if (type === 2)
      //切换了把预填数据清空
      category.value = null
    modeType.value = type
    select.style.animationName = 'gone'
    select.style.animationDuration = '0.6s'
    select.style.animationFillMode = 'forwards'

    mode.style.animationName = 'show'
    mode.style.animationDuration = '0.6s'
    mode.style.animationFillMode = 'forwards'
  } else {
    select.style.animationName = 'show'
    select.style.animationDuration = '0.6s'
    select.style.animationFillMode = 'forwards'

    mode.style.animationName = 'gone'
    mode.style.animationDuration = '0.6s'
    mode.style.animationFillMode = 'forwards'
  }
}
//表单收集数据——price
const standardPrice = ref(props.mode === 1 ? props.data.standard_price : null)
const salePrice = ref(props.mode === 1 ? props.data.sale_price : null)

//表单收集数据——variation
const update = ref(false)
var skuCount = 0
const variationToForm = () => {
  var list = []
  variationList.value.forEach((item) => {
    list.push({
      id: item.id,
      code: item.variantSku,
      spu_id: item.spu_id,
      material: item.materials,
      size: item.size,
      color: item.color
    })
  })
  return list
}
//添加Variation逻辑
const g_variations = ref([])
const s_variations = ref([])
const variationList = ref([])
const g_sizeAndDel = ref([null])
const s_sizeAndDel = ref([null])
const sizeAndDel = ref([null])
const materials = ref()
const size = ref()
const color = ref()
const tagStore = ref({
  materials: [],
  size: [],
  color: []
})
const tags = ref({
  materials: [],
  size: [],
  color: []
})

//填充为空检查
const checkInput = () => {
  if (!materials.value || !size.value || !color.value) {
    instance.proxy.$buefy.toast.open({
      message: 'Blank space is not allowed!',
      type: 'is-danger'
    })
    return false
  }
  for (const item of variationList.value) {
    if (
      item.materials.toLowerCase() === materials.value.toLowerCase() &&
      item.size.toLowerCase() === size.value.toLowerCase() &&
      item.color.toLowerCase() === color.value.toLowerCase()
    ) {
      instance.proxy.$buefy.toast.open({
        message: 'You have already created this variation!',
        type: 'is-danger'
      })
      return false
    }
  }
  return true
}

const generation = () => {
  if (
    !tags.value.materials.length ||
    !tags.value.size.length ||
    !tags.value.color.length
  ) {
    instance.proxy.$buefy.toast.open({
      message: 'Blank space is not allowed!',
      type: 'is-danger'
    })
    return false
  } else {
    g_variations.value = []
    g_sizeAndDel.value = [null]
    tags.value.materials.forEach((item1) => {
      tags.value.size.forEach((item2) => {
        tags.value.color.forEach((item3) => {
          g_variations.value.push({
            id: null,
            spu_id: props.mode === 1 ? props.data.id : null,
            materials: item1,
            size: item2,
            color: item3,
            variantSku: ''
          })

          if (!g_sizeAndDel.value.includes(item2))
            g_sizeAndDel.value.splice(-1, 0, item2)
        })
      })
    })
    variationList.value = g_variations.value.concat(s_variations.value)
    sizeAndDel.value = g_sizeAndDel.value.concat(s_sizeAndDel.value)
    sizeAndDel.value.pop()
    reSort()
  }
}

const addVariation = () => {
  if (checkInput()) {
    s_variations.value.push({
      id: null,
      spu_id: props.mode === 1 ? props.data.id : null,
      materials: materials.value,
      size: size.value,
      color: color.value,
      variantSku: sku.value === '' ? skuCount++ : sku.value + '-' + skuCount++
    })

    if (!s_sizeAndDel.value.includes(size.value))
      s_sizeAndDel.value.splice(-1, 0, size.value)
  }
  variationList.value = g_variations.value.concat(s_variations.value)
  sizeAndDel.value = g_sizeAndDel.value.concat(s_sizeAndDel.value)
  sizeAndDel.value.pop()
  materials.value = null
  size.value = null
  color.value = null
}

//删除Variation逻辑
const variationDel = (row) => {
  variationList.value = variationList.value.filter(
    (item) =>
      item.materials !== row.materials ||
      item.size !== row.size ||
      item.color !== row.color
  )
  reSort()
  //更改带删除键的表
  if (!variationList.value.filter((item) => item.size === row.size).length)
    sizeAndDel.value = sizeAndDel.value.filter((item) => item !== row.size)

  //更新key值，保证table更新渲染
  update.value = !update.value
}

//更新联动
const reSort = () => {
  if (sku.value !== '') {
    skuCount = 0
    variationList.value.forEach((item) => {
      item.variantSku = sku.value + '-' + skuCount++
    })
  } else {
    skuCount = 0
    variationList.value.forEach((item) => {
      item.variantSku = skuCount++
    })
  }
}

//表单收集数据——size
const sizeToForm = () => {
  const result = {}
  for (const item of sizeList.value.slice(0, -1)) {
    const { attribute, size } = item

    for (const [key, value] of Object.entries(size)) {
      result[key] = result[key] || {}
      result[key][attribute] = value
    }
  }

  return result
}
//rule
const rule = ref(props.mode === 1 ? props.data.rule_name : null)
const ruleList = ref()
const getRuleList = async () => {
  const res = await getRule(1, 100)
  ruleList.value = res.data
}
//添加Size逻辑
const sizeList = ref([{ attribute: null, size: null }])
const attribute = ref()
watch(attribute, (newVal) => {
  if (newVal) {
    if (attributeCheck(newVal)) {
      sizeList.value.splice(-1, 0, {
        attribute: newVal,
        size: {}
      })
    } else {
      instance.proxy.$buefy.toast.open({
        message: 'You have already set this attribute!',
        type: 'is-danger',
        duration: 5000
      })
    }
    attribute.value = null
  }
})
const attributeCheck = (val) => {
  for (const item of sizeList.value) {
    if (item.attribute === val) return false
  }
  return true
}
//删除Size逻辑
const sizeUpdate = ref(false)
const attributeDel = (attribute) => {
  sizeList.value = sizeList.value.filter((item) => item.attribute !== attribute)
  //更新key值，保证table更新渲染
  sizeUpdate.value = !sizeUpdate.value
}

//图片上传逻辑
const imgList = ref([])
const dropFiles = ref([])
const imgCheck = () => {
  for (const item of dropFiles.value) {
    if (item.type !== 'image/png' && item.type !== 'image/jpeg') {
      instance.proxy.$buefy.toast.open({
        message: 'Please upload images in PNG/JPEG format',
        type: 'is-danger',
        duration: 5000
      })
      return false
    }
  }
  return true
}
const imgInput = () => {
  let time
  if (time) clearTimeout(time)
  time = setTimeout(() => {
    if (imgCheck()) {
      dropFiles.value.forEach((item) => {
        imgList.value.push({
          file: item,
          url: URL.createObjectURL(item)
        })
      })
    }
  }, 300)
}
const imgDel = (url) => {
  imgList.value = imgList.value.filter((item) => item.url !== url)
}

//页面退出事件
const handleEmit = (index) => {
  if (checkAll()) {
    if (index === 0) {
      instance.proxy.$buefy.dialog.confirm({
        message: 'Are you sure to add this product?',
        canCancel: ['button'],
        onConfirm: () => {
          addImg()
        }
      })
    } else {
      instance.proxy.$buefy.dialog.confirm({
        message: 'Are you sure to modify this product?',
        canCancel: ['button'],
        onConfirm: () => {
          addImg()
        }
      })
    }
  }
}
//检查操作
const checkAll = () => {
  if (
    !proName.value ||
    !sku.value ||
    !type.value ||
    !category.value ||
    !standardPrice.value ||
    !salePrice.value ||
    !rule.value ||
    !checkList()
  ) {
    instance.proxy.$buefy.toast.open({
      message:
        'You must fill in all the information in the form except for the optional!',
      type: 'is-danger',
      duration: 5000
    })
    return false
  } else if (imgList.value.length === 0) {
    instance.proxy.$buefy.toast.open({
      message: 'Please upload at least one image of the product!',
      type: 'is-danger',
      duration: 5000
    })
    return false
  } else {
    return true
  }
}
//表单检查
const checkList = () => {
  if (variationList.value.length === 0 || sizeList.value.length === 1) {
    return false
  }

  for (const item of variationList.value) {
    if (item.variantSku === '') {
      return false
    }
  }

  for (const item of sizeList.value.slice(0, -1)) {
    for (const size of sizeAndDel.value.slice(0, -1)) {
      if (!item.size[size]) {
        return false
      }
    }
  }

  return true
}

//添加或修改请求
var image_path_list = []
var addCount = 0
const addImg = () => {
  var addLength = imgList.value.length
  imgList.value.forEach(async (item) => {
    if (item.file) {
      const formData = new FormData()
      formData.append('file', item.file)
      const res = await putImg(formData)
      image_path_list.push(res.file_name)
    } else {
      image_path_list.push(item.url.slice(33))
    }
    addCount++
    if (addCount === addLength) isNew()
  })
}

//验证是否为新的Category
const isNew = () => {
  if (checkNew()) {
    createNew()
  } else {
    add(1)
  }
}

const checkNew = () => {
  for (const key in categoryList.value) {
    if (categoryList.value[key].toLowerCase() === category.value.toLowerCase())
      return false
  }
  return true
}

//创建新的Category
const createNew = async () => {
  const res = await addCategoryType(category.value)
  add(2, res.last_row_id)
}

const add = async (index, cateId) => {
  console.log({
    id: props.mode === 1 ? props.data.id : null,
    code: sku.value,
    type: true,
    category_id: index === 1 ? typeToId(category.value) : cateId,
    name: proName.value,
    description: des.value,
    image_path_list: image_path_list,
    size_chart: sizeToForm(),
    pattern_path: '',
    standard_price: standardPrice.value,
    sale_price: salePrice.value,
    created_time: props.mode === 1 ? props.data.created_time : null,
    modified_time: props.mode === 1 ? props.data.modified_time : null,
    sku_list: variationToForm(),
    rule_name: rule.value
  })
  try {
    const res = await addProduct({
      id: props.mode === 1 ? props.data.id : null,
      code: sku.value,
      type: true,
      category_id: index === 1 ? typeToId(category.value) : cateId,
      name: proName.value,
      description: des.value,
      image_path_list: image_path_list,
      size_chart: sizeToForm(),
      pattern_path: '',
      standard_price: standardPrice.value,
      sale_price: salePrice.value,
      created_time: props.mode === 1 ? props.data.created_time : null,
      modified_time: props.mode === 1 ? props.data.modified_time : null,
      sku_list: variationToForm(),
      rule_name: rule.value
    })
    addRule(res.product_id)
  } catch {
    instance.proxy.$buefy.toast.open({
      message: 'The SKU already exists, please fill in the information again',
      type: 'is-danger',
      duration: 5000
    })
  }
}

const addRule = async (id) => {
  const selectRule = ruleList.value.filter(
    (item) => item.name === rule.value
  )[0]
  await addRuleToSpu(
    id,
    JSON.parse(selectRule.screen_rule),
    JSON.parse(selectRule.size_code_to_name)
  )
  emit('changeBlock', 0)
}

//删除操作
const delAdmit = (id) => {
  instance.proxy.$buefy.dialog.confirm({
    message: 'Are you sure to delete?',
    canCancel: ['button'],
    onConfirm: async () => {
      delPro(id)
    }
  })
}
const delPro = async (product_id) => {
  await delProduct({ product_id })
  emit('changeBlock', 0)
}
//查询是否可以删除
const isok = ref(false)
const delMsg = ref('This product is active. So it cannot be deleted.')
const isok_delete = async () => {
  isok.value = await isok_del(props.data.id)
  delMsg.value =
    'This product still has uncompleted orders. So it cannot be deleted.'
}

//初始化
onMounted(() => {
  getType()
  getRuleList()
  //edit模式时填充
  if (props.mode === 1) {
    if (props.data.status === 'hidden') isok_delete()
    props.data.sku_list.forEach((item) => {
      variationList.value.push({
        id: item.id,
        spu_id: item.spu_id,
        materials: item.material,
        size: item.size,
        color: item.color,
        variantSku: item.code
      })

      if (!sizeAndDel.value.includes(item.size))
        sizeAndDel.value.splice(-1, 0, item.size)
    })

    var chart = JSON.parse(props.data.size_chart)
    const keys = Object.keys(chart)
    for (const attribute in chart[keys[0]]) {
      const size = {}
      for (const key of keys) {
        size[key] = parseInt(chart[key][attribute])
      }
      sizeList.value.splice(-1, 0, { attribute, size })
    }

    props.data.image_path_list.forEach((item) => {
      imgList.value.push({
        file: null,
        url: 'https://info.cafilab.com/spu_img/' + unicode2Ch(item)
      })
    })
  }
})

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
    <b-tooltip
      class="rcMain-del"
      :label="delMsg"
      position="is-bottom"
      :active="!isok"
      multilined
      v-if="
        userStore.profileInfo.auth_list.includes('Product_delete') && mode === 1
      "
    >
      <b-button
        @click="delAdmit(data.id)"
        :disabled="!isok"
        class="rcMain-del-bn"
      >
        DELETE
      </b-button>
    </b-tooltip>
    <button class="rcMain-add" @click="handleEmit(0)">
      {{ mode === 1 ? 'MODIFY' : 'ADD' }}
    </button>
    <div class="rcMain-left">
      <div class="rcMain-left-sroll">
        <div class="rcMain-left-title">Product information</div>
        <div class="rcMain-left-line"></div>
        <div class="rcMain-left-detail">
          <div class="rcMain-left-detail-input">
            <p>Product name</p>
            <b-field>
              <b-input
                v-model="proName"
                placeholder="Enter the product name"
              ></b-input>
            </b-field>
          </div>
          <div class="rcMain-left-detail-input">
            <p>SKU</p>
            <b-field>
              <b-input v-model="sku" placeholder="Enter the sku"></b-input>
            </b-field>
          </div>
          <div class="rcMain-left-detail-input">
            <p>Type</p>
            <b-field>
              <b-select v-model="type" placeholder="Select the type">
                <option value="wear">Ready to wear</option>
                <!-- <option value="measure">Made to measure</option> -->
              </b-select>
            </b-field>
          </div>
          <div class="rcMain-left-detail-input">
            <p>Category</p>
            <b-field>
              <div class="rcMain-left-detail-input-select" v-if="mode === 0">
                <div id="select">
                  <b-button
                    type="is-primary"
                    @click="categoryAni_add(1, 1)"
                    style="margin-bottom: 10px"
                    >Select existent</b-button
                  >
                  <b-button
                    type="is-primary"
                    @click="categoryAni_add(1, 2)"
                    style="margin-bottom: 10px"
                    >Add new</b-button
                  >
                </div>

                <div id="mode">
                  <b-select
                    v-model="category"
                    placeholder="Select a existing category"
                    v-show="modeType === 1"
                  >
                    <option
                      v-for="(item, index) in categoryList"
                      :key="index"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </b-select>
                  <b-input
                    v-model="category"
                    placeholder="Enter a new category to create"
                    v-show="modeType === 2"
                  ></b-input>
                  <b-button type="is-primary" @click="categoryAni_add(2)">
                    <b-icon icon="step-backward" size="is-small"></b-icon>
                  </b-button>
                </div>
              </div>

              <div class="rcMain-left-detail-input-select" v-else>
                <div id="select_edit">
                  <b-button
                    type="is-primary"
                    @click="categoryAni_edit(1, 1)"
                    style="margin-bottom: 10px"
                    >Select existent</b-button
                  >
                  <b-button
                    type="is-primary"
                    @click="categoryAni_edit(1, 2)"
                    style="margin-bottom: 10px"
                    >Add new</b-button
                  >
                </div>

                <div id="mode_edit">
                  <b-select
                    v-model="category"
                    placeholder="Select a existing category"
                    v-show="modeType === 1"
                  >
                    <option
                      v-for="(item, index) in categoryList"
                      :key="index"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </b-select>
                  <b-input
                    v-model="category"
                    placeholder="Enter a new category to create"
                    v-show="modeType === 2"
                  ></b-input>
                  <b-button type="is-primary" @click="categoryAni_edit(2)">
                    <b-icon icon="step-backward" size="is-small"></b-icon>
                  </b-button>
                </div>
              </div>
            </b-field>
          </div>
          <div class="rcMain-left-detail-des">
            <p>Project description <b style="color: #27678c">(optional)</b></p>
            <b-field>
              <b-input
                maxlength="200"
                type="textarea"
                placeholder="Enter the description if there is"
                v-model="des"
                style="resize: none"
              ></b-input>
            </b-field>
          </div>
        </div>

        <div class="rcMain-left-title">Pricing</div>
        <div class="rcMain-left-line"></div>
        <div class="rcMain-left-detail">
          <div class="rcMain-left-detail-input">
            <p>Standard price</p>
            <b-numberinput
              controls-alignment="right"
              v-model="standardPrice"
              placeholder="Enter the standard price"
            ></b-numberinput>
          </div>
          <div class="rcMain-left-detail-input">
            <p>Sale price</p>
            <b-numberinput
              controls-alignment="right"
              v-model="salePrice"
              placeholder="Enter the sale price"
            ></b-numberinput>
          </div>
        </div>

        <div class="rcMain-left-title">Variations</div>
        <div class="rcMain-left-line"></div>
        <div class="rcMain-left-detail">
          <div class="rcMain-left-detail-variation">
            <p>Materials / Size / Colour</p>
          </div>
          <div class="rcMain-left-detail-variation">
            <b-button type="is-primary" @click="generation()"
              >Generate Combination</b-button
            >
            <div
              class="tip"
              @click="
                $buefy.dialog.alert({
                  title: 'Generate Combination',
                  message:
                    'You can add tags for Materials, Size, and Colour, and the Generate Combination function will produce all the possible combinations to enable bulk creation.',
                  confirmText: 'I know'
                })
              "
            >
              Learn more
            </div>
          </div>
          <div class="rcMain-left-detail-variation" style="margin-bottom: 40px">
            <b-field>
              <b-taginput
                v-model="tags.materials"
                icon="label"
                type="is-primary"
                placeholder="Enter the Materials"
                @add="
                  (text) => {
                    tagStore.materials.push(text)
                  }
                "
              >
              </b-taginput>
            </b-field>
            <b-field>
              <b-taginput
                v-model="tags.size"
                icon="label"
                type="is-primary"
                placeholder="Enter the size"
                @add="
                  (text) => {
                    tagStore.size.push(text)
                  }
                "
              >
              </b-taginput>
            </b-field>
            <b-field>
              <b-taginput
                v-model="tags.color"
                icon="label"
                type="is-primary"
                placeholder="Enter the Colour"
                @add="
                  (text) => {
                    tagStore.color.push(text)
                  }
                "
              >
              </b-taginput>
            </b-field>
          </div>

          <div class="rcMain-left-detail-variation">
            <b-button type="is-primary" @click="addVariation()"
              >Single Addition</b-button
            >
            <div
              class="tip"
              @click="
                $buefy.dialog.alert({
                  title: 'Single Addition',
                  message:
                    'For a single specific variation, you can add it through Single Addition. These variations will not be affected by changes coming from Generate Combination.',
                  confirmText: 'I know'
                })
              "
            >
              Learn more
            </div>
          </div>
          <div class="rcMain-left-detail-variation" style="margin-bottom: 40px">
            <b-field style="width: 30%">
              <b-input
                v-model="materials"
                placeholder="Enter the Materials"
              ></b-input>
            </b-field>
            <div class="line"></div>
            <b-field style="width: 30%">
              <b-input v-model="size" placeholder="Enter the size"></b-input>
            </b-field>
            <div class="line"></div>
            <b-field style="width: 30%">
              <b-input v-model="color" placeholder="Enter the Colour"></b-input>
            </b-field>
          </div>

          <b-table
            :data="variationList"
            narrowed
            :mobile-cards="false"
            :key="update"
            v-show="variationList.length !== 0"
          >
            <b-table-column
              label="Variants"
              width="100"
              centered
              v-slot="props"
            >
              {{ props.row.materials }}/{{ props.row.size }}/{{
                props.row.color
              }}
            </b-table-column>

            <b-table-column label="SKU" width="80" centered v-slot="props">
              <b-input v-model="props.row.variantSku" size="is-small"></b-input>
            </b-table-column>

            <b-table-column width="10" centered v-slot="props">
              <button
                type="button"
                class="delete"
                @click="variationDel(props.row)"
              />
            </b-table-column>
          </b-table>
        </div>

        <div class="rcMain-left-title" v-show="variationList.length !== 0">
          Size chart
        </div>
        <div class="rcMain-left-line" v-show="variationList.length !== 0"></div>
        <div class="rcMain-left-detail" v-show="variationList.length !== 0">
          <div class="rcMain-left-detail-input">
            <p>Rule</p>
            <b-field>
              <b-select v-model="rule" placeholder="Select a Rule">
                <option
                  v-for="(item, index) in ruleList"
                  :key="index"
                  :value="item.name"
                >
                  {{ item.name }}
                </option>
                <!-- <option value="measure">Made to measure</option> -->
              </b-select>
            </b-field>
          </div>
          <div class="rcMain-left-detail-variation">
            <p>
              <!-- You <b style="color: #ea6e5d">MUST</b> add your size chart if your
              product type is “Ready to wear” -->
              (UNIT : CM)
            </p>
            <b-button type="is-primary" @click="isImageModalActive = true"
              >Attribute example</b-button
            >
            <b-modal v-model="isImageModalActive" :canCancel="['x']">
              <div class="container">
                <p><img src="@/assets/images/example.png" /></p>
                <p><img src="@/assets/images/attribute.png" /></p>
              </div>
            </b-modal>
          </div>

          <b-table
            :data="sizeList"
            narrowed
            :mobile-cards="false"
            scrollable
            :key="sizeUpdate"
          >
            <b-table-column
              label="Attribute\Size"
              width="20"
              centered
              sticky
              headerClass="attribute"
              cellClass="attribute"
              v-slot="props"
            >
              <p v-show="props.row.attribute">{{ props.row.attribute }}</p>
              <b-select
                v-model="attribute"
                placeholder="Attribute"
                size="is-small"
                v-show="!props.row.attribute"
              >
                <option value="Bust">Bust</option>
                <option value="Shoulder">Shoulder</option>
                <option value="Waist">Waist</option>
                <option value="Height">
                  Height(average, with a range of ±5)
                </option>
                <option value="Neck">Neck</option>
                <option value="Arm">Arm</option>
                <option value="Shoulder to Waist">Shoulder to Waist</option>
                <option value="Shoulder to Hip">Shoulder to Hip</option>
                <option value="Knee">Knee</option>
                <option value="Outseam">Outseam</option>
                <option value="Ankle">Ankle</option>
                <option value="Upper Waist">Upper Waist</option>
                <option value="Sleeve Length">Sleeve Length</option>
                <option value="Hip">Hip</option>
                <option value="Thigh">Thigh</option>
                <option value="Calf">Calf</option>
                <option value="Inseam">Inseam</option>
              </b-select>
            </b-table-column>

            <b-table-column
              v-for="(item, index) in sizeAndDel"
              :key="index"
              :label="item ? item : ''"
              :width="item ? 150 : 10"
              centered
              v-slot="props"
            >
              <b-numberinput
                :controls="false"
                v-model="props.row.size[item]"
                size="is-small"
                v-if="item && props.row.attribute"
              ></b-numberinput>

              <button
                type="button"
                class="delete"
                @click="attributeDel(props.row.attribute)"
                v-if="!item && props.row.attribute"
              />
            </b-table-column>
          </b-table>
        </div>
      </div>
    </div>
    <div class="rcMain-right">
      <div class="rcMain-right-title">Product images</div>
      <div class="rcMain-right-line"></div>
      <div class="rcMain-right-img">
        <div class="rcMain-right-img-item">
          <b-upload
            v-model="dropFiles"
            multiple
            native
            drag-drop
            expanded
            name="file"
            style="height: 100%"
            @input="imgInput()"
          >
            <div class="rcMain-right-img-content" @drop="imgInput()">
              <p>
                <b-icon icon="upload" size="is-medium"> </b-icon>
              </p>
              <p>Drop your images here or click to upload</p>
            </div>
          </b-upload>
        </div>
        <div
          v-for="(item, index) in imgList"
          :key="index"
          class="rcMain-right-img-item"
        >
          <div>
            <img :src="item.url" />
            <button type="button" class="delete" @click="imgDel(item.url)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

::v-deep .input::-webkit-input-placeholder {
  color: $black;
  opacity: 0.5;
}

::v-deep .table thead > tr {
  background-color: $secondary;
  font-size: 16px;

  & > th {
    color: $light;
    vertical-align: middle;
  }
}

::v-deep .table tbody > tr {
  background-color: rgba($color: $secondary, $alpha: 0.15);
  font-size: 16px;

  & > td {
    vertical-align: middle;
  }
}

::v-deep .attribute {
  background-color: $secondary !important;
  color: $light !important;
  font-weight: 600;
}

.container {
  display: flex;
  justify-content: space-around;
  align-items: center;

  p {
    width: 40%;
    height: 100%;

    img {
      object-fit: contain;
    }
  }
}

.rcMain {
  height: 100%;
  width: 100%;
  padding: 56px 60px 0;
  position: relative;
  display: flex;
  justify-content: center;

  &-del {
    position: absolute;
    top: 0;
    right: 160px;
    width: 80px;
    height: 40px;
    border-radius: 5px;

    &-bn {
      width: 80px;
      height: 40px;
      color: $light;
      font-weight: 600;
      border-radius: 5px;
      background-color: $danger;
    }
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
    height: 76vh;
    width: 68%;
    margin-right: 4%;
    background-color: $light;
    overflow-y: auto;

    &-sroll {
      height: auto;
      width: 100%;
    }

    &-title {
      padding: 2% 6%;
      height: 60px;
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
      padding: 4% 6%;
      width: 100%;
      height: auto;
      font-size: 18px;
      display: flex;
      flex-direction: column;

      &-input {
        width: 100%;
        min-height: 80px;
        display: flex;
        justify-content: space-between;

        .field {
          width: 50%;

          ::v-deep .select {
            width: 100%;

            select {
              width: 100%;
            }
          }
        }

        &-select {
          width: 100%;
          position: relative;
          overflow: hidden;

          #select {
            width: 100%;
            position: relative;
            right: 0;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
          }

          #mode {
            width: 100%;
            position: absolute;
            display: flex;
            right: -100%;

            div {
              flex: 1;
            }

            .button {
              padding: 0;
              width: 8%;
            }
          }

          #select_edit {
            width: 100%;
            position: absolute;
            right: -100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
          }

          #mode_edit {
            position: relative;
            right: 0;
            width: 100%;
            display: flex;

            div {
              flex: 1;
            }

            .button {
              padding: 0;
              width: 8%;
            }
          }
        }

        ::v-deep .b-numberinput {
          position: relative;

          &::before {
            position: absolute;
            top: 5px;
            left: -20px;
            content: '$';
            font-size: 20px;
            font-weight: 600;
            color: #7957d5;
          }
        }
      }

      &-variation {
        width: 100%;
        height: auto;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;

        .line {
          width: 4px;
          height: 100%;
          border-radius: 50px;
          background-color: $primary;
        }

        .tip {
          font-size: 12px;
          align-self: center;
          text-decoration: underline;
          color: $danger;
          cursor: pointer;
        }

        .field {
          width: 100%;
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

  &-right {
    box-shadow: 2px 10px 15px rgba(0, 0, 0, 0.25);
    height: 76vh;
    width: 30%;
    background-color: $light;
    display: flex;
    flex-direction: column;

    &-title {
      padding: 0 6%;
      height: 60px;
      width: 100%;
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: 600;
      color: $black;
    }

    &-line {
      height: 1px;
      width: 100%;
      background-color: #d9d9d9;
    }

    &-img {
      width: 100%;
      flex: 1;
      display: flex;
      justify-content: start;
      align-content: start;
      flex-wrap: wrap;
      overflow: auto;

      &-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: 14px;
        color: $black;
      }

      &-item {
        height: 160px;
        width: 40%;
        margin: 4% 5%;

        div {
          height: 160px;
          position: relative;

          img {
            height: 160px;
            object-fit: contain;
          }

          button {
            position: absolute;
            top: 4px;
            left: 4px;
          }
        }
      }
    }

    &-des {
      padding: 2% 6%;
      height: 60px;
      width: 100%;
      font-size: 16px;
      color: $black;

      b {
        color: $danger;
      }
    }
  }
}
</style>

<style>
@keyframes gone {
  0% {
    position: relative;
    right: 0;
  }

  100% {
    position: absolute;
    right: -100%;
  }
}

@keyframes show {
  0% {
    position: absolute;
    right: -100%;
  }

  100% {
    position: relative;
    right: 0;
  }
}
</style>
