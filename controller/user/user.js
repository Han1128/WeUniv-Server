const mongoose = require('../../mongodb/db');
const Bcrypt = require('../../utils/pwdbcrypt');
const config = require('../../config/index');
const fs = require('fs');
// 引入model
const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const followModel = require('../../models/follow/follow');
const schoolModel = require('../../models/user/school');

// 引入封装方法
const Mailer = require('../../utils/mailtransport');
const Token = require('../../middleware/token');
const Qi = require('../../utils/qiniu');

class User {
  /**
   * 用户登录
   * @param { Object } req 
   * @param { Object } res 
   */
  userLogin (req, res) {
    // 登录信息可能是用户名或者邮箱
    userModel.find({ $or: [{ email: req.body.email }, { username: req.body.email }] }, function (err, ret) {
      if (err) {
        res.send({
          message: '账号不存在',
          success: false
        })
      }
      else {
        // console.log('验证结果', Bcrypt.untieSalt(req.body.password, ret[0].password))
        // 将从数据库查到的用户密码进行解密比较
        if (ret.length !== 0 && Bcrypt.untieSalt(req.body.password, ret[0].password)) {
          // 生成token
          let token = Token.createToken({ name: req.body.email, longinDate: +new Date});
          // 更新token
          userModel.update({ username: ret[0].username }, {$set: { token : token }}, function (err) {
            if (err) {
              res.send({
                message: '更新token出错',
                success: false
              })
            }
            res.send({
              message: '登录成功',
              success: true,
              data: {
                userid: ret[0]._id,
                username: ret[0].username,
                email: ret[0].email,
                token
              }
            })
          })
        }
        else {
          res.send({
            message: '密码出错',
            success: false
          })
        }
      }
    })
  }
  checkToken (req, res) {
    userModel.findOne({ username: req.query.username }, function(err, ret) {
      if (err) {
        res.json({
            success: false,
            message: '用户！'
        })
      }
      // Token.validateToken(ret.token)
      console.log('token ', Token.checkToken(ret.token))
      res.send({
        message: '验证成功',
        success: true
      })
    })
  }
  /**
   * 用户注册
   * @param {Object} req 
   * @param {Object} res 
   */
  async sendEmail (req, res) {
    try {
      let randomCode = Math.floor(Math.random()*1000000); // 生成六位随机码
      // 将randomCode保存在Session中
      req.session.code = randomCode;
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
  /**
   * 用户从邮箱的验证链接请求邮箱验证
   * @param {Object} req 
   * @param {Object} res 
   */
  async checkMail(req, res) {
    // 发送邮件
    if (!req.session.code) {
      res.json({
          success: false,
          message: '验证码超时,请重新发送邮箱验证'
      })
    }
    if (req.session.code === Number(req.body.code)) {
      try {
        const newObjectId = mongoose.Types.ObjectId();
        const newUser = new userModel({
          username: req.body.username,
          email: req.body.email,
          userType: req.body.userType,
          password: Bcrypt.genSalt(req.body.password),
          gender: req.body.gender,
          birth: req.body.birth,
          token: '',
          status: 1,
          follow: newObjectId,
          schoolData: newObjectId,
          topArticle: '',
          createTime: new Date()
        })
        await userModel.create(newUser);

        const newSchoolData = new schoolModel({
          _id: newObjectId,
          author: newUser._id
        })
        await newSchoolData.save();
        const newFollow = new followModel({
          _id: newObjectId,
          author: newUser._id,
          following_num: 0,
          follower_num: 0
        })
        await followModel.create(newFollow);
        
        res.json({
            success: true,
            message: '用户添加成功'
        })
      } catch (error) {
        console.log('error', error)
        res.json({
            success: false,
            message: '用户添加失败,请重试'
        })
      }
    }
    else {
      res.json({
          success: false,
          message: '验证码错误,请重新输入'
      })
    }
  }
  /**
   * 验证输入用户名或邮箱是否存在
   * @param {*} req 
   * @param {*} res 
   */
  checkUserExist(req, res) {
    const checkOption = req.body.checkType === 'username' ? {
      username: req.body.checkData
    } : {
      email: req.body.checkData
    }
    userModel.findOne(checkOption, function(err, ret) {
      if (err) return;
      if (ret) {
        if (ret && ret.status) {
          // 存在且已激活
          res.json({
              success: false,
              message: '该用户已注册！'
          })
        }
        else {
          // 存在未激活
          res.json({
              success: false,
              message: '该用户未激活邮箱！'
          })
        }
      }
      else {
        res.json({
            success: true,
            message: '该用户未注册！'
        })
      }
    })
  }
  // 获取用户信息
  async getUserDetails(req, res) {
    try {
      let result = await userModel.findOne({ _id: req.query.id}, {
        token: 0, status: 0, password: 0
      }).populate('follow').populate('schoolData');
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result: result
        }
      })
    } catch (err) {
      console.log('err', err)
      res.send({
        success: false,
        message: '查询用户信息失败,请稍后重试'
      })
    }
  }
  // 头像上传
  async uploadAvatar(req, res) {
    try {
      // 先上传再删图
      let key = req.body.imgName + Date.parse(new Date()) + '.png';
      let base64str = req.body.cropperImg.replace('data:image/png;base64,', '');
      let filePath = __dirname + '/' + key;
      await fs.writeFile(filePath, base64str, 'base64')
      // let buff = new Buffer(base64str, 'base64');
      // await fs.writeFile(filePath, buff); // 这种方式的buff可能转换出错
      let respBody = await Qi.putFileToQiniu(key, filePath);

      if (req.body.oldAvatar) {
        // 先删除旧图
        let splitArr = req.body.oldAvatar.split('/');
        let key = splitArr[splitArr.length - 1];
        await Qi.deleteFromQiniu(key);
      }

      let updateResult = await userModel.findOneAndUpdate({ '_id' : req.body.userId }, {$set: {'avatar': 'http://' + config.qiniu.addr + '/' + respBody.key }})
      if (updateResult) {
        res.json({
          success: true,
          message:'上传成功',
          data: {
            url: 'http://' + config.qiniu.addr + '/' + respBody.key
          }
        })
      }
      else {
        res.json({
            success: false,
            message:'上传成功但保持信息失败'
        })
      }
    } catch (error) {
      console.log('error', error)
    }
  }
}

module.exports = new User()