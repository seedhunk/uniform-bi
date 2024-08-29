import service from '@/utils/commonJs/http'

// recent接口
export function getRecent(date) {
  return service({
    url: '/branch/1/appointment',
    method: 'GET',
    params: {
      day: date
    }
  })
}

// all接口
export function getAll(params) {
  return service({
    url: '/branch/1/appointment',
    method: 'GET',
    params
  })
}

// cancel接口
export function cancelOppointment(id, status, day, period) {
  return service({
    url: `/appointment/${id}`,
    method: 'PUT',
    data: {
      appointment_status: status,
      appointment_day: day,
      appointment_period: period
    }
  })
}
