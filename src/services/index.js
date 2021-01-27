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

export function guideSearch(body, rSymbol) {
  return request.post({
    url: '/foreign-news/api/svc/Foreign/queryNewsV3',
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

export function getAbstract(body, rSymbol) {
  return request.post({
    url: '/foreign-news/api/svc/Foreign/getAbstract',
    data: body,
    rSymbol,
  })
}

export function register(body, rSymbol) {
  return request.post({
    url: '/foreign-news/api/svc/ForeignLogin/register',
    data: body,
    rSymbol,
  })
}

export function getProfile(body, rSymbol) {
  return request.get({
    url: '/foreign-news/api/svc/Foreign/getProfile',
    data: body,
    rSymbol,
  })
}

// export function (body, rSymbol) {
//   return request.post({
//     url: '/foreign-news/api/svc/ForeignLogin/',
//     data: body,
//     rSymbol,
//   })
// }

// export function (body, rSymbol) {
//   return request.post({
//     url: '/foreign-news/api/svc/ForeignLogin/',
//     data: body,
//     rSymbol,
//   })
// }
