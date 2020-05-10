const GLOBAL = window.GLOBAL || {}
GLOBAL.requestSymbols = Object.create(null)

GLOBAL.requestCancel = (rSymbol, msg = '') => {
  if (GLOBAL.requestSymbols[rSymbol]) {
    GLOBAL.requestSymbols[rSymbol](msg)
    delete GLOBAL.requestSymbols[rSymbol]
  }
}

global.getCookie = (cname) => {
  const name = `${cname}=`
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim()
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
  }
  return ''
}

global.setCookie = (cname, cvalue, exdays) => {
  const d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
  const expires = `expires=${d.toGMTString()}`
  // const Domain = 'domain=.newsminer.net';
  const Domain = 'domain=localhost'
  document.cookie = `${cname}=${cvalue};${expires};${Domain}`
}

global.domainName = {
  api: 'https://api2.newsminer.net',
}

export const dva = {
  config: {
    onError(err) {
      err.preventDefault()
      console.error(err.message)
    },
  },
}
