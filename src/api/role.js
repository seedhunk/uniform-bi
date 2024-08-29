import service from '@/utils/commonJs/http'

// 分页获取role接口
export function getRole(id, offset, count, name) {
  return service({
    url: `/branch/${id}/role`,
    method: 'GET',
    params: {
      offset,
      count,
      name
    }
  })
}

// 创建role接口
export function addRole(id, role_name, authority_list, role_id) {
  return service({
    url: `/branch/${id}/role`,
    method: 'POST',
    data: {
      role_id,
      role_name,
      authority_list: JSON.stringify(authority_list)
    }
  })
}

// 删除role接口
export function delRole(role_id) {
  return service({
    url: `/branch/role/delete`,
    method: 'DELETE',
    data: {
      role_id
    }
  })
}
