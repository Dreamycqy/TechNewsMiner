window.GLOBAL = window.GLOBAL || {}
window.GLOBAL.requestSymbols = Object.create(null)

window.GLOBAL.requestCancel = (rSymbol, msg = '') => {
  if (window.GLOBAL.requestSymbols[rSymbol]) {
    window.GLOBAL.requestSymbols[rSymbol](msg)
    delete window.GLOBAL.requestSymbols[rSymbol]
  }
}

export const dva = {
  config: {
    onError(err) {
      err.preventDefault()
      console.error(err.message)
    },
  },
}
