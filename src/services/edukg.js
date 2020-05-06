import qs from 'qs'
import request from '../utils/request'

export function getPermission(body, rSymbol) {
  return request.post({
    url: '/eduPersona/api/getPermission',
    data: body,
    dataType: 'text',
    rSymbol,
  })
}

export function search(body, rSymbol) {
  return request.get({
    url: '/eduPersona/api/totalsearch',
    data: body,
    rSymbol,
  })
}

export function detailTable(body, rSymbol) {
  return request.get({
    url: '/eduPersona/api/changebyinstancelist',
    data: body,
    rSymbol,
  })
}

export function graphSearch(body, rSymbol) {
  return request.get({
    url: '/eduPersona/api/instanceList',
    data: body,
    rSymbol,
  })
}

export function qaSearch(body, rSymbol) {
  return request.post({
    url: '/eduPersona/api/course/inputQuestion',
    data: qs.stringify(body),
    rSymbol,
  })
}
