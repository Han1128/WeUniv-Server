const mongoose = require('../../mongodb/db');
const Bcrypt = require('../../utils/pwdbcrypt');
const config = require('../../config/index');
const fs = require('fs');
// 引入model
const userModel = require('../../models/user/user');
const schoolModel = require('../../models/user/school');

// 引入封装方法
const Mailer = require('../../utils/mailtransport');
const Token = require('../../middleware/token');
const Qi = require('../../utils/qiniu');

class UserUpdate {
  // 邮箱验证
  async verificateByEmail (req, res) {
    try {
      let randomCode = Math.floor(Math.random()*1000000); // 生成六位随机码
      // 将randomCode保存在Session中
      req.session[req.body.type] = randomCode;
      if (await Mailer.sendMail(req.body.email, randomCode) === 'success') {
        res.json({
            success: true,
            cacheEmail: req.body.email,
            message:'邮件已发送,请完成邮箱验证'
        })
      }
      else {
        res.json({
            success: false,
            message:'邮件发送出错,请稍后重试'
        })
      }
    } catch (err) {
      console.log('err', err)
      res.json({
          success: false,
          message:'邮件发送出错,请稍后重试'
      })
    }
  }
  // 验证新邮箱并更新邮箱
  async resetUserEmail(req, res, next) {
    try {
      if (!req.session[req.body.type]) {
        res.json({
            success: false,
            message: '验证码超时,请重新发送邮箱验证'
        })
      }
      if (req.session[req.body.type] === Number(req.body.code)) {
        await userModel.update({
          _id: req.body.userId
        }, {
          email: req.body.email
        });
      }

      res.json({
          success: true,
          message: '邮箱修改成功!'
      })
    } catch (error) {
      res.json({
          success: false,
          message: '更新邮箱出错,请稍后重试!'
      })
    }
  }
  // 更新用户密码
  async updateUserPwd(req, res, next) {
    try {
      debugger
      await userModel.update({
        _id: req.body.userId
      }, {
        password: Bcrypt.genSalt(req.body.password)
      })
      res.json({
          success: true,
          message: '密码修改成功!'
      })
    } catch (error) {
      res.json({
          success: false,
          message: '更新邮箱出错,请稍后重试!'
      })
    }
  }
  /**
   * 验证输入密码是否正确
   * @param {*} req 
   * @param {*} res 
   */
  async verificatePwd(req, res) {
    try {
      const result = await userModel.findOne({
        _id : req.query.userId
      })
      if (Bcrypt.untieSalt(req.query.pwd, result.password)) {
        res.json({
            success: true,
            message: '密码正确'
        })
      }
      else {
        res.json({
            success: false,
            message: '密码不正确,请检查输入'
        })
      }
    } catch (error) {
      res.json({
          success: false,
          message: '密码不正确,请检查输入'
      })
    }
  }
  async resetUserPwd(req, res) {
    try {
      if (!req.session[req.body.type]) {
        res.json({
            success: false,
            message: '验证码超时,请重新发送邮箱验证'
        })
      }
      debugger
      if (req.session[req.body.type] === Number(req.body.code)) {
        await userModel.update({
          _id: req.body.userId
        }, {
          password: Bcrypt.genSalt(req.body.password)
        });
      }
      res.json({
          success: true,
          message: '密码修改成功,请重新登录!'
      })
    } catch (error) {
      res.json({
        success: false,
        message: '重置密码失败,请稍后重试'
    })
    }
  }
  // 修改更新用户信息
  async updateUserInfo(req, res) {
    try {
      let condition = {};
      condition[req.body.key] = req.body.value
      debugger
      await userModel.update({ _id: req.body.userId}, {
        $set: condition
      })
      res.send({
        success: true,
        message: '更新成功'
      })
    } catch (err) {
      console.log('err', err)
      res.send({
        success: false,
        message: '查询用户信息失败,请稍后重试'
      })
    }
  }
  // 修改更新用户在校信息
  async updateUserSchoolInfo(req, res) {
    try {
      let condition = {};
      condition[req.body.key] = req.body.value
      await schoolModel.update({ author: req.body.userId}, {
        $set: condition
      })
      res.send({
        success: true,
        message: '更新成功'
      })
    } catch (err) {
      console.log('err', err)
      res.send({
        success: false,
        message: '查询用户信息失败,请稍后重试'
      })
    }
  }
}

module.exports = new UserUpdate()