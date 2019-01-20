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
        html: "<a href='http://127.0.0.1:3000/checkMail?code=" + code + "&account=" + reqMail + "'>点击激活</a>" // html内容
      }
      // console.log('data', mailData)
      return new Promise((resolve, reject) => {
        mailTransporter.sendMail(mailData, function(err, info) {
          if (err) {
            console.log('mail err', err);
            reject('error');
          }
          console.log('mail res', info.response);
          resolve('success');
        })
      })
  }
}

module.exports = new Mailer();
