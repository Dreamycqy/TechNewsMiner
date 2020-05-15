const index = require('./routes/index')
const proxy = require('./routes/proxy')
const image = require('./routes/image')
// const auth = require('./routes/auth')

const routesConfig = [
  {
    path: ['/api/*'],
    route: proxy,
  }, {
    path: ['/pic/*'],
    route: image,
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
