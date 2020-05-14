const request = require('request')
const express = require('express')
const qs = require('qs')

const router = express.Router()
const config = require('../config')

router.all('/', (req, res) => {
  let url = req.baseUrl
  console.log(url)
  if (url.indexOf('/pic/') > -1) {
    url = url.split('/pic/')[1] // eslint-disable-line
  }
  request({
    url,
    method: "GET",
    encoding: null,
    forever: true,
    headers: {
      'Accept-Encoding': 'gzip, deflate'
    }
  }, (error, response, body) => {
    if (!error) {
        res.set('Content-Type', 'image/jpg;');
        res.send(new Buffer.from(body, 'base64'));
    }
  })
})

module.exports = router
