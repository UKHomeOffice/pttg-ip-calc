const express = require('express')
const serveStatic = require('serve-static')
const app = express()
const bodyParser = require('body-parser')

app.use(serveStatic('dist/', { 'index': ['index.html'] }))
app.use(bodyParser.json())

app.get('/ping', (req, res) => {
  res.send('')
})

app.get('/healthz', (req, res) => {
  res.send({env: process.env.ENV, status: 'OK'})
})

app.listen(process.env.PORT || 3000, () => {
  console.log('The server is running')
})
