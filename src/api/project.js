import service from '@/utils/commonJs/http'

// 获取Project接口
export function getProject(id, params) {
  return service({
    url: `/project/${id}/subList`,
    method: 'GET',
    params
  })
}

// 修改或增加Project接口
export function modifyOrAddProject(data) {
  return service({
    url: '/project',
    method: 'PUT',
    data
  })
}

// 删除前通知接口
export function delNotification(data) {
  return service({
    url: '/notification',
    method: 'POST',
    data
  })
}

// 删除Project接口
export function delProject(data) {
  return service({
    url: '/project',
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

//获取product列表
export function getProductList() {
  return service({
    url: '/productCop',
    method: 'GET'
  })
}

//添加product
export function addProductToSub(data) {
  return service({
    url: '/cooperation',
    method: 'PUT',
    data
  })
}

//删除product
export function delProductToSub(data) {
  return service({
    url: '/cooperation',
    method: 'DELETE',
    data
  })
}
