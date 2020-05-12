import request from '@/utils/request'

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

export function subQueryNews(body, rSymbol) {
  return request.post({
    url: '/techNews/api/svc/Foreign/subQueryNews',
    data: body,
    rSymbol,
  })
}

export function getFilterKeyword(body, rSymbol) {
  return request.get({
    url: '/techNews/api/svc/Foreign/getFilterKeyword',
    data: body,
    rSymbol,
  })
}

export function updateFilterKeyword(body, rSymbol) {
  return request.post({
    url: '/techNews/api/svc/Foreign/updateFilterKeyword',
    data: body,
    rSymbol,
  })
}
