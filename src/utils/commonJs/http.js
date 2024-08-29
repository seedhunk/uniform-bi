import axios from 'axios'
import { ToastProgrammatic as Toast } from 'buefy'
import tokenCheck from '@/utils/commonJs/tokenCheck'

//创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8000',
  // baseURL: 'https://aob.bi.cafilab.com',
  timeout: 5000, //超时时间
  headers: {
    accept: 'application/json'
  }
})

//请求拦截
//就是你请求接口的时候，我会先拦截下来，对你的数据做一个判断，或者携带个token给你
service.interceptors.request.use(
  (config) => {
    if (localStorage.getItem('login')) {
      if (
        config.url !== '/user/token_isexpired' &&
        config.url !== '/user/re_token'
      ) {
        tokenCheck()
      }
      config.headers.Authorization =
        'Bearer ' + JSON.parse(localStorage.getItem('login')).token
    }
    return config //必须返回出去，不然请求发不出去
  },
  (error) => {
    //处理错误请求
    return Promise.reject(error)
  }
)
//响应拦截：后端返回来的结果
service.interceptors.response.use(
  (res) => {
    const code = res.status //code是后端的状态码
    if (code !== 200) {
      //请求失败（包括token失效，302，404...根据和后端约定好的状态码做出不同的处理）
      return Promise.reject(res)
    } else {
      //请求成功
      return Promise.resolve(res.data)
    }
  },
  (err) => {
    if (err.response.status === 403) {
      Toast.open({
        type: 'is-danger',
        message: 'Insufficient permissions!'
      })
    }
    //处理错误响应
    return Promise.reject(err)
  }
)
//因为别的地方要用，所以就把实例暴露出去，导出
export default service
