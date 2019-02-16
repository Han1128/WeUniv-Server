const userModel = require('../../models/user/user');
const Bcrypt = require('../../utils/pwdbcrypt');
const Mailer = require('../../utils/mailtransport');
const Token = require('../../middleware/token');

// 邮箱验证是否存在
function mailValidate (mail) {
  userModel.findOne({ email: mail }, function (err, doc) {
    return doc ? true : false;
  })
}
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
          type: 'error',
          message: '账号不存在',
          status: 0
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
                type: 'error',
                message: '更新token出错',
                status: 0
              })
            }
            res.send({
              type: 'success',
              message: '登录成功',
              status: 1,
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
            type: 'error',
            message: '密码出错',
            status: 0,
            data: []
          })
        }
      }
    })
  }
  checkToken (req, res) {
    userModel.findOne({ username: req.query.username }, function(err, ret) {
      if (err) {
        res.json({
            status: 0,
            success: false,
            message: '用户！',
            data:[]
        })
      }
      // Token.validateToken(ret.token)
      console.log('token ', Token.checkToken(ret.token))
      res.send({
        type: 'success',
        message: '验证成功',
        status: 1,
        data: []
      })
    })
  }
  /**
   * 用户注册
   * @param {Object} req 
   * @param {Object} res 
   */
  userRegister (req, res) {
    // 邮箱验证是否存在
    if (!mailValidate(req.body.email)) {
      // console.log('加盐结果', Bcrypt.genSalt(req.body.password));
      const randomCode = Math.floor(Math.random()*10000000); // 生成六位随机码
      const newUser = new userModel({
        username: req.body.username,
        userType: req.body.userType,
        password: Bcrypt.genSalt(req.body.password),
        gender: req.body.gender,
        birth: req.body.birth,
        email: req.body.email,
        token: '',
        status: 0,
        createTime: new Date(),
        code: randomCode
      })
      // node版本太低使用不了async和await
      newUser.save(async function(err) {
        if (err) {
          res.json({
              status:0,
              success: false,
              message:'添加失败',
              data:[]
          })
        }
        else {
          if (await Mailer.sendMail(newUser.email, newUser.code) === 'success') {
            console.log('邮件已发送,请完成邮箱验证')
            res.json({
                status: 1,
                success: true,
                message:'邮件已发送,请完成邮箱验证',
                data:[]
            })
          }
          else {
            console.log('邮件发送出错,请稍后重试')
            res.json({
                status: 0,
                success: false,
                message:'邮件发送出错,请稍后重试',
                data:[]
            })
          }
        }
      })
    }
    else {
      res.json({
          status: 0,
          success: false,
          message: '该邮箱已存在,请修改!',
          data:[]
      })
    }
  }
  /**
   * 用户从邮箱的验证链接请求邮箱验证
   * @param {Object} req 
   * @param {Object} res 
   */
  checkMail(req, res) {
    // console.log('startTime', req._startTime)
    userModel.findOne({ email: req.body.account }, function(err, ret) {
      if (err) {
        res.json({
            success: false,
            message: '邮箱不存在！'
        })
      }
      if (req.body.code === ret.code) {
        console.log('验证码正确 date', new Date(req._startTime) - new Date(ret.createTime))
        if (new Date(req._startTime) - new Date(ret.createTime) < 900000) {
          // 验证时间小于15min
          userModel.update({ email: ret.email }, { status: 1}, function(updateErr, updateRet) {
            if (updateErr) {
              res.json({
                  success: false,
                  message: '更新失败!'
              })
            }
            res.json({
                success: true,
                message: '注册成功!'
            })
            // res.redirect('http://localhost:9000/WeUniv/login', 301);
          })
        }
        else {
          // res.redirect('http://localhost:9000/WeUniv/error?errMsg=验证超时,请重新注册！', 301);
          res.json({
              success: false,
              message: '验证超时,请重新注册！'
          })
        }
      }
      else {
        res.json({
            success: false,
            message: '验证码出错,请重新注册！'
        })
      }
    })
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
            message: '该用户未注册！',
            data:[]
        })
      }
    })
  }
}

module.exports = new User()