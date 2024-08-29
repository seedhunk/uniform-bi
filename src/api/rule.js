import service from '@/utils/commonJs/http'

// 分页获取rule接口
export function getRule(page, pageCount) {
  return service({
    url: `/get_screen_rule`,
    method: 'POST',
    data: {
      page,
      pageCount
    }
  })
}

// 往product里面添加rule接口
export function addRuleToSpu(spuId, screenRule, sizeCodeToName) {
  return service({
    url: `/product/${spuId}/screen_rule`,
    method: 'PUT',
    data: {
      screenRule,
      sizeCodeToName
    }
  })
}

// 获取rule_name接口
export function getRuleName() {
  return service({
    url: `/get_screen_rule_name`,
    method: 'GET'
  })
}
