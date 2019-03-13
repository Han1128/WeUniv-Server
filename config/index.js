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
  },
  qiniu: {
    accessKey: 'aCbZAXsFXjSQ0L6hPhR5xTXDY5CtlSMoa6aFbV-1',
    secretKey: 'hZL_VodWVCmPAWHJ8wyuE4XnGBWaG4pUaEv43tNm',
    bucket: 'we_univ',
    addr: 'pnybr76es.bkt.clouddn.com',
    publicBucketDomain: 'http://pnybr76es.bkt.clouddn.com'
  }
}