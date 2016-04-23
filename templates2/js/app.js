const Koa = require('koa')
const app = new Koa()
const router = require('koa-router')()
const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')()
const log4js = require('koa-log4')
const logger = log4js.getLogger('app')

const index = require('./routes/index')
const users = require('./routes/users')

// middlewares
app.use(convert(bodyparser))
app.use(convert(json()))
app.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }))
app.use(convert(require('koa-static')(__dirname + '/public')))

onerror(app)

app.use(views(__dirname + '/views', {
  extension: '{views}'
}))

// logger
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })
app.use(co.wrap(function * (ctx, next) {
  const start = new Date()
  yield next()
  const ms = new Date() - start
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
}))

router.use('/', index.routes(), index.allowedMethods())
router.use('/users', users.routes(), users.allowedMethods())

app.use(router.routes(), router.allowedMethods())
// response

app.on('error', function (err, ctx) {
  logger.error(err)
  logger.error('server error', err, ctx)
})

module.exports = app
