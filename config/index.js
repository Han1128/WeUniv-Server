'use strict';

module.exports = {
  port: 3000,
  url: 'mongodb://localhost:27017/MyUniv',
  secret: 'WeUniv', // 生成Token密钥
  email: {
    host: "smtp.163.com",
    post: 25, //SMTP端口
    secureConnection: true, // 使用SSL
    auth: {
      user: 'ChrisYu1128@163.com',
      pass: 'yzh446' //smtp密码
    }
  }
}