import request from '@/utils/request'

export function login(body, rSymbol) {
  return request.post({
    url: 'https://api2.newsminer.net/svc/ForeignLogin/login',
    data: body,
    rSymbol,
  })
}

export function search(body, rSymbol) {
  return request.post({
    url: 'https://api2.newsminer.net/svc/Foreign/queryNewsV2',
    data: body,
    rSymbol,
  })
}

export function subQueryNews(body, rSymbol) {
  return request.post({
    url: 'https://api2.newsminer.net/svc/Foreign/subQueryNewsV2',
    data: body,
    rSymbol,
  })
}

export function getFilterKeyword(body, rSymbol) {
  return request.get({
    url: 'https://api2.newsminer.net/svc/Foreign/getFilterKeyword',
    data: body,
    rSymbol,
  })
}

export function updateFilterKeyword(body, rSymbol) {
  return request.post({
    url: 'https://api2.newsminer.net/svc/Foreign/updateFilterKeyword',
    data: body,
    rSymbol,
  })
}
