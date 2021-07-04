export default [
  {
    path: '/',
    redirect: '/foreign-news/index',
  },
  {
    path: '/foreign-news',
    redirect: '/foreign-news/index',
  },
  {
    path: '/foreign-news/login',
    component: './login',
  },
  {
    path: '/foreign-news/reg',
    component: './login/reg',
  },
  {
    path: '/foreign-news',
    component: '../layouts',
    routes: [
      {
        path: './index',
        component: './home',
      },
      {
        path: './abstract',
        component: './abstract',
      },
      {
        path: './user',
        component: './user',
      },
      {
        path: './tree',
        component: './tree',
      },
      {
        path: './guide',
        component: './guide',
      },
      {
        path: './paperMaker',
        component: './paperMaker',
      },
    ],
  },
]
