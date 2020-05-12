export default [
  {
    path: '/',
    redirect: '/index',
  },
  {
    path: '/login',
    component: './login',
  },
  {
    path: '/',
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
