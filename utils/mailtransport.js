const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const config = require('../config/index');

class Mailer {
  sendMail(reqMail, code) {
      const mailTransporter = nodemailer.createTransport(smtpTransport(config.email));
      const mailData = {
        from: `ChrisYu1128 <${config.email.auth.user}>`, // 发送地址
        to: reqMail, // 收件对象
        subject: 'This is validate email from WeUniv.', // 标题
        // html: "<a href='http://127.0.0.1:3000/api/checkMail?code=" + code + "&account=" + reqMail + "'>点击激活</a>" // html内容
        html: "<h5>邮箱激活码为" + code + ",请在15min内完成激活。</h5>"
      }
      // console.log('data', mailData)
      return new Promise((resolve, reject) => {
        mailTransporter.sendMail(mailData, function(err, info) {
          if (err) {
            reject('error');
          }
          resolve('success');
        })
      })
  }
}

module.exports = new Mailer();
