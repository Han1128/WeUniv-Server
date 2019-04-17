const express = require('express')
const routes = require('./routes')
const morgan = require('morgan'); // 命令行log显示
const bodyParser = require('body-parser') // 对post请求体进行解析
const passport = require('passport');// 用户认证模块passport
let session = require('express-session');
var cookieParser = require('cookie-parser');
const app = express()

// 使用静态资源
app.use('/node_modules/', express.static('./node_modules/'))
app.use('/public/', express.static('./public/'))

// 配置session
app.use(cookieParser('weuniv'));
app.use(session({
  secret: 'weuniv',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 15*60* 1000  // 有效期，单位是毫秒
  }
}))

app.use(passport.initialize());// 初始化passport模块
app.use(morgan('dev'));// 命令行中显示程序运行日志,便于bug调试

// 配置模板引擎和 body-parser 一定要在 app.use(routes) 挂载路由之前
app.use(bodyParser.json({limit: '50mb'})) // parse application/json
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})) // parse application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.send('GET request to the Weuniv homepage');
});
routes(app);


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

const server = require('http').createServer(app);
// const io = require('socket.io')(server);
// global.io = io;
// global.userSocket = {}
// io.on('connection', function (socket) {
//   console.log('socket.io连接成功');
//   socket.on('user_login', function (data) {
//     console.log('userid', data.userId)
//     // userSocket[data.userId] = socket.id
//     socket.join(data.userId)
//     console.log('sockect', socket)
//   })
// });

// io.on('disconnect', function (socket) {
//   socket.emit('user disconnected');
// });

server.listen(3000, function () {
  console.log('app is running at port 3000')
});

// app.listen(3000, function () {
//   console.log('app is running at port 3000')
// })

// module.exports = io