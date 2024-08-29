import service from '@/utils/commonJs/http'

// 分页获取inventory接口
export function getInventory(id, offset, count) {
  return service({
    url: `/branch/${id}/inventory`,
    method: 'GET',
    body: {
      offset,
      count
    }
  })
}

// 更改threshold接口
export function changeSingleThreshold(id, inventory_id, threshold) {
  return service({
    url: `/branch/${id}/inventory/${inventory_id}/threshold`,
    method: 'PUT',
    data: {
      threshold
    }
  })
}

// 更新inventory接口
export function rectifyInventory(id, inventory_id, current) {
  return service({
    url: `/branch/${id}/inventory/${inventory_id}/rectify`,
    method: 'PUT',
    data: {
      current
    }
  })
}

// 更改全部threshold接口
export function changeAllThreshold(id, inventory_id_list, threshold) {
  return service({
    url: `/branch/${id}/inventory/threshold`,
    method: 'PUT',
    data: {
      inventory_id_list,
      threshold
    }
  })
}

// 删除Inventory接口
export function delInventory(id, inventory_id_list) {
  return service({
    url: `/branch/${id}/inventories`,
    method: 'DELETE',
    data: {
      inventory_id_list
    }
  })
}
