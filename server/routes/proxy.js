const request = require('request')
const express = require('express')
const qs = require('qs')

const router = express.Router()
const config = require('../config')

router.all('/', (req, res) => {
  const { hostname } = req
  const { method } = req
  let url = req.baseUrl
  const { basePath, xlink, abstract  } = config
  if (url.indexOf('api') > -1) {
    url = url.split('/api')[1] // eslint-disable-line
  }
  if (url.indexOf('kCardSearch') > -1) {
    url = 'http://39.100.31.203:8077/linkInstance'
  } else if (url.indexOf('abstract') > -1) {
    url = abstract + url
  } else if (url.indexOf('xlink') > -1) {
    url = xlink + url
  } else {
    url = (typeof basePath === 'string' ? basePath : basePath[hostname]) + url
  }
  const opt = {
    method: req.method,
    url,
    headers: {
      'Content-Type': url.indexOf('abstract') > -1 ? 'application/json' : 'application/x-www-form-urlencoded;charset=utf-8',
      'Authorization': method === 'GET' && url.indexOf('abstract') < 0 ? req.query.uid : req.body.uid,
      'Accept': '*/*'
    },
    timeout: 40e3,
    json: true,
    pool: {
      maxSockets: Infinity,
    },
  }
  if (req.body.uid) {
    delete req.body.uid
  }
  if (req.query.uid) {
    delete req.query.uid
  }
  if (method === 'GET') {
    opt.qs = req.query
  } else {
    opt.json = true
    opt.body = url.indexOf('abstract') > -1 ? req.body : qs.stringify(req.body)
  }
  request(opt, (error, response, body) => {
    try {
      if (!error) {
        if (response && response.statusCode) {
          res.status(response.statusCode)
        }
        if (typeof body === 'string') {
          res.json(JSON.parse(body))
        } else {
          res.json(body)
        }
      } else {
        res.json({ header: { code: 1, message: typeof error === 'string' ? error : JSON.stringify(error) }, data: [] })
      }
    } catch (error) { // eslint-disable-line
      // res.json({ header: { code: 1, message: '服务器发生错误!', error, }, data: [] });
      res.json({ token: body })
    }
  })
})

module.exports = router
