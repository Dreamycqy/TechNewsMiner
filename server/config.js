const express = require('express')

const config = {
  dev: {
    env: 'development',
    port: '8111',
    basePath: 'https://api2.newsminer.net',
  },
  test: {
    env: 'test',
    port: '8111',
    basePath: 'https://api2.newsminer.net',
  },
  production: {
    env: 'production',
    port: '8111',
    basePath: 'https://api2.newsminer.net',
  },
}
module.exports = config[process.env.NODE_ENV || 'development']
