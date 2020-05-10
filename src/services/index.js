import qs from 'qs'
import request from '@/utils/request'

export function getPermission(body, rSymbol) {
  return request.post({
    url: '/api/getPermission',
    data: body,
    dataType: 'text',
    rSymbol,
  })
}

export function graphSearch(body, rSymbol) {
  return request.get({
    url: '/api/instanceList',
    data: body,
    rSymbol,
  })
}

export function qaSearch(body, rSymbol) {
  return request.post({
    url: '/api/course/inputQuestion',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function login(body, rSymbol) {
  return request.post({
    url: '/techNews/api/svc/ForeignLogin/login',
    data: body,
    rSymbol,
  })
}

export function search(body, rSymbol) {
  return request.post({
    url: '/techNews/api/svc/Foreign/queryNews',
    data: body,
    rSymbol,
  })
}
