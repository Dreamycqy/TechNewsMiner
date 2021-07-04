const express = require('express')

const config = {
  dev: {
    env: 'development',
    port: '8111',
    basePath: 'https://api2.newsminer.net',
    xlink: 'https://xlink.xlore.org/xlinkapi',
    abstract: 'http://39.100.31.203:5000',
  },
  test: {
    env: 'test',
    port: '8111',
    basePath: 'https://api2.newsminer.net',
    xlink: 'https://xlink.xlore.org/xlinkapi',
    abstract: 'http://39.100.31.203:5000',
  },
  production: {
    env: 'production',
    port: '8111',
    basePath: 'https://api2.newsminer.net',
    xlink: 'https://xlink.xlore.org/xlinkapi',
    abstract: 'http://39.100.31.203:5000',
  },
}
module.exports = config[process.env.NODE_ENV || 'development']
