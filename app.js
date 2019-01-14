const express = require('express')
const router = require('./routes/index')
const morgan = require('morgan'); // 命令行log显示
const bodyParser = require('body-parser') // 对post请求体进行解析
const passport = require('passport');// 用户认证模块passport
const Strategy = require('passport-http-bearer').Strategy;// token验证模块
const app = express()

// 使用静态资源
app.use('/node_modules/', express.static('./node_modules/'))
app.use('/public/', express.static('./public/'))

app.use(passport.initialize());// 初始化passport模块
app.use(morgan('dev'));// 命令行中显示程序运行日志,便于bug调试

// 配置模板引擎和 body-parser 一定要在 app.use(router) 挂载路由之前
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json

app.use('/api', router); // 为所有路由加上/api前缀

// //允许跨域
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Headers', 'X-Token, Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials','true');   // 新增
  if (req.method == 'OPTIONS') {
      res.send(200); /*让options请求快速返回*/
  }
  else {
      next();
  }
})

app.listen(3000, function () {
  console.log('app is running at port 3000')
})

// module.exports = app