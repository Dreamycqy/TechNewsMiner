const express = require('express')

const config = {
  dev: {
    env: 'development',
    port: '8111',
    basePath: 'http://eduPersona.cn',
  },
  test: {
    env: 'test',
    port: '8111',
    basePath: 'http://eduPersona.cn',
  },
  production: {
    env: 'production',
    port: '8111',
    basePath: 'http://eduPersona.cn',
  },
}
module.exports = config[process.env.NODE_ENV || 'development']
