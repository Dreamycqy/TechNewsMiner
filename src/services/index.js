import request from '@/utils/request'

export function login(body, rSymbol) {
  return request.post({
    url: '/foreign-news/api/svc/ForeignLogin/login',
    data: body,
    rSymbol,
  })
}

export function search(body, rSymbol) {
  return request.post({
    url: '/foreign-news/api/svc/Foreign/queryNewsV2',
    data: body,
    rSymbol,
  })
}

export function subQueryNews(body, rSymbol) {
  return request.post({
    url: '/foreign-news/api/svc/Foreign/subQueryNewsV2',
    data: body,
    rSymbol,
  })
}

export function getFilterKeyword(body, rSymbol) {
  return request.get({
    url: '/foreign-news/api/svc/Foreign/getFilterKeyword',
    data: body,
    rSymbol,
  })
}

export function updateFilterKeyword(body, rSymbol) {
  return request.post({
    url: '/foreign-news/api/svc/Foreign/updateFilterKeyword',
    data: body,
    rSymbol,
  })
}

export function getContentByIds(body, rSymbol) {
  return request.post({
    url: '/foreign-news/api/svc/Foreign/getContentByIds',
    data: body,
    rSymbol,
  })
}
