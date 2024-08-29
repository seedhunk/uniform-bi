import service from '@/utils/commonJs/http'

// 分页获取staff接口
export function getSta(id, offset, count, name) {
  return service({
    url: `/branch/${id}/staff`,
    method: 'GET',
    params: {
      offset,
      count,
      name
    }
  })
}

// 创建staff接口
export function addSta(data) {
  return service({
    url: `/staff`,
    method: 'PUT',
    data
  })
}

// 删除staff接口
export function delSta(staff_id) {
  return service({
    url: `/staff/delete`,
    method: 'DELETE',
    data: {
      staff_id
    }
  })
}
