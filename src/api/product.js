import service from '@/utils/commonJs/http'

// 分页获取Product接口
export function getProduct(params) {
  return service({
    url: `/product`,
    method: 'GET',
    params
  })
}

// 添加Product接口
export function addProduct(data) {
  return service({
    url: `/product`,
    method: 'PUT',
    data
  })
}

// 删除Product接口
export function delProduct(data) {
  return service({
    url: `/product`,
    method: 'DELETE',
    data
  })
}

//获取category类型
export function getCategoryType() {
  return service({
    url: '/category',
    method: 'GET'
  })
}

//新建category类型
export function addCategoryType(category_name) {
  return service({
    url: '/category',
    method: 'PUT',
    data: {
      category_name
    }
  })
}

//获取sku
export function getSku() {
  return service({
    url: '/sku',
    method: 'GET'
  })
}

// 获取code
export function getCode() {
  return service({
    url: `/productCode`,
    method: 'GET'
  })
}

// 获取code
export function changeStatus(data) {
  return service({
    url: `/change_spu_status`,
    method: 'PUT',
    data
  })
}

// 查询product是否可以删除
export function isok_del(spu_id) {
  return service({
    url: `/product_del_isok/${spu_id}`,
    method: 'GET'
  })
}
