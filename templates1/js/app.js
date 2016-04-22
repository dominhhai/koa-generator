const app = require('koa')()
const koa = require('koa-router')()
const json = require('koa-json')
const views = require('koa-views')
const onerror = require('koa-onerror')
const path = require('path')
const log4js = require('koa-log4')
const logger = log4js.getLogger('app')

const index = require('./routes/index')
const users = require('./routes/users')

// global middlewares
app.use(views('views', {
  root: path.join(__dirname, 'views'),
  default: '{views}'
}))
app.use(require('koa-bodyparser')())
app.use(json())
app.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }))

onerror(app)

app.use(function *(next) {
  var start = new Date()
  yield next
  var ms = new Date() - start
  logger.info('%s %s - %s', this.method, this.url, ms)
})

app.use(require('koa-static')(path.join(__dirname, 'public')))

// routes definition
koa.use('/', index.routes(), index.allowedMethods())
koa.use('/users', users.routes(), users.allowedMethods())

// mount root routes
app.use(koa.routes())

app.on('error', function (err, ctx) {
  logger.error('server error', err, ctx)
})

module.exports = app