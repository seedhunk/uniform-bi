import service from '@/utils/commonJs/http'

// 分页获取branch接口
export function getBranch(offset, count, name) {
  return service({
    url: '/branch',
    method: 'GET',
    params: {
      offset,
      count,
      name
    }
  })
}

// 创建或修改接口
export function postBranch(data) {
  return service({
    url: '/branch',
    method: 'POST',
    data
  })
}

// 删除接口
export function delBranch(branch_id) {
  return service({
    url: `/branch/${branch_id}`,
    method: 'DELETE'
  })
}
