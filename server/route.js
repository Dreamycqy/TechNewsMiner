const index = require('./routes/index')
const proxy = require('./routes/proxy')
// const auth = require('./routes/auth')

const routesConfig = [
  {
    path: ['/:module/api/*'],
    route: proxy,
  }, {
  //   path: ['/:module/oauth/*'],
  //   route: auth,
  // }, {
    path: '**',
    route: index,
  },
]

function initRoute(app) {
  for (let i = 0, len = routesConfig.length; i < len; i++) {
    const con = routesConfig[i]
    app.use(con.path, con.route)
  }
}

module.exports = initRoute
