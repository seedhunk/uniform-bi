import service from '@/utils/commonJs/http'

// 分页获取Order接口
export function getOrder(branch_id, params) {
  return service({
    url: `/${branch_id}/orders`,
    method: 'GET',
    params
  })
}

// 分页获取转移Order接口
export function getTranferOrder(branch_id) {
  return service({
    url: `/${branch_id}/transfer_orders`,
    method: 'GET'
  })
}

// 获取具体Order信息接口
export function getOrderDetail(order_id) {
  return service({
    url: `/order/${order_id}`,
    method: 'GET'
  })
}

// 更新new
export function notNew(order_id) {
  return service({
    url: `/order/${order_id}`,
    method: 'POST'
  })
}

// 修改Order信息接口
export function updateOrder(
  order_id,
  order_status,
  history_status,
  pickup_time,
  history_pickup_time,
  commentList
) {
  return service({
    url: `/order/update/${order_id}`,
    method: 'POST',
    data: {
      history_status,
      order_status,
      pickup_time,
      history_pickup_time,
      commentList
    }
  })
}

// 转移Order接口
export function transferOrder(
  order_id,
  branch_name,
  transfer_branch_name,
  branch_id,
  transfer_branch_id
) {
  return service({
    url: `/order/transfer/${order_id}`,
    method: 'POST',
    data: {
      branch_name,
      transfer_branch_name,
      branch_id,
      transfer_branch_id
    }
  })
}

// 完成或取消转移Order接口
export function transferDoneOrder(order_id, type, branch_id) {
  return service({
    url: `/order/transfer_done/${order_id}`,
    method: 'POST',
    data: {
      type,
      branch_id
    }
  })
}
