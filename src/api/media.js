import service from '@/utils/commonJs/http'

// 分页获取img接口
export function getImg(offset, count) {
  return service({
    url: `/list_files/${offset}/${count}`,
    method: 'GET'
  })
}

// 上传img接口
export function putImg(data) {
  return service({
    url: '/file/tmp',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 删除img接口
export function delImg(data) {
  return service({
    url: '/list_files/delete',
    method: 'POST',
    data
  })
}

// 获取img_name接口
export function getImgName() {
  return service({
    url: `/list_files_name`,
    method: 'GET'
  })
}
