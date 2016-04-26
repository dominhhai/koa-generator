const app = require('koa')()
const router = require('koa-router')()
const json = require('koa-json')
const views = require('koa-views')
const onerror = require('koa-onerror')
const serve = require('koa-static')
const path = require('path')
const log4js = require('koa-log4')
const logger = log4js.getLogger('app')

const index = require('./routes/index')
const users = require('./routes/users')

// middlewares
app.use(require('koa-bodyparser')())
app.use(json())
app.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }))
app.use(serve(path.join(__dirname, 'public')))

// setup view
app.use(views('views', {
  root: path.join(__dirname, 'views'),
  default: '{views}'
}))

// handle error
onerror(app)

// logger
app.use(function *(next) {
  var start = new Date()
  yield next
  var ms = new Date() - start
  logger.info('%s %s - %s', this.method, this.url, ms)
})

// routes definition
router.use('/', index.routes(), index.allowedMethods())
router.use('/users', users.routes(), users.allowedMethods())

// mount root routes
app.use(router.routes())
	.use(router.allowedMethods())

// log error
app.on('error', function (err, ctx) {
  logger.error('server error', err, ctx)
})

module.exports = app
