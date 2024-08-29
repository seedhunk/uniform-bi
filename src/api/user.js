import service from '@/utils/commonJs/http'

// 登录接口
export function putUserDetail(data, time) {
  return service({
    url: `/user/token/${time}`,
    method: 'POST',
    data
  })
}

// 注册接口
export function singup(data) {
  return service({
    url: `/user`,
    method: 'PUT',
    data
  })
}

// token过期验证
export function isExpired() {
  return service({
    url: '/user/token_isexpired',
    method: 'GET'
  })
}

// 重新生成token
export function reToken() {
  return service({
    url: '/user/re_token',
    method: 'GET'
  })
}

// 获取个人信息接口
export function getSelf() {
  return service({
    url: `/staff/self`,
    method: 'GET'
  })
}

// 修改密码接口
export function changePwd(data) {
  return service({
    url: `/user/password`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

//发送邮箱
export function sendMailToRest(mail) {
  return service({
    url: `/send_mail`,
    method: 'POST',
    data: {
      email: [mail]
    }
  })
}

// 修改密码接口
export function resetPwd(email, code, new_password) {
  return service({
    url: `/user/reset_password`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      email,
      code
    },
    data: {
      new_password
    }
  })
}
