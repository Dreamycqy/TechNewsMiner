export default [
  {
    path: '/foreign-news',
    redirect: '/foreign-news/index',
  },
  {
    path: '/foreign-news/login',
    component: './login',
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
    ],
  },
]
