const express = require('express')
const app = express()

// //允许跨域
// app.all('*', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header('Access-Control-Allow-Headers', 'X-Token, Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Credentials','true');   // 新增
//   if (req.method == 'OPTIONS') {
//       res.send(200); /*让options请求快速返回*/
//   }
//   else {
//       next();
//   }
// })

app.post('/api/login', function(req, res) {
    console.log('收到客户端请求,请求路径是' + req.url);
    var resData = {
      code: 0,
      data: [
        {
          username: "chris",
          password: "123456"
        }
      ],
      success: true,
      message: "Success"
    }
    res.end(JSON.stringify(resData))
  }
)
app.listen(3000, function () {
  console.log('app is running at port 3000')
})