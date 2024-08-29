import service from '@/utils/commonJs/http'

// 分页获取customer接口
export function getCus(page, pageCount) {
  return service({
    url: '/customer/get',
    method: 'POST',
    data: {
      page,
      pageCount
    }
  })
}

// 获取profile接口
export function getPro(user_id) {
  return service({
    url: '/profile/get',
    method: 'POST',
    data: { user_id }
  })
}

// 获取history接口
export function getHis(user_id) {
  return service({
    url: '/history/get',
    method: 'POST',
    data: { user_id }
  })
}
