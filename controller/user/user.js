const userModel = require('../../models/user/user');
const config = require('../../config/index');
const Bcrypt = require('../../utils/pwdbcrypt');
const Mailer = require('../../utils/mailtransport');
const jwt = require('jsonwebtoken');

function createToken (data) {
  let token = jwt.sign(data, config.secret, {
    expiresIn: 10080
  });
  return token;
  // let created = Math.floor(Date.now() / 1000);
  //   let cert = fs.readFileSync(path.join(__dirname, '../config/pri.pem'));//私钥
  //   let token = jwt.sign({
  //       data,
  //       exp: created + 3600 * 24
  //   }, cert, {algorithm: 'RS256'});
  //   return token;
}
function validateToken (token) {
  jwt.verify(token, config.secret, (err, decoded) => {
    console.log('开始验证');
    return err ? false : true;
  })
}
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
    // 验证token
    // if (!req.headers.authorization) {
    //   return res.status(401).send(JSON.stringify({
    //     type: 'error',
    //     message: '未授权',
    //     status: 0,
    //     data: []
    //   }))
    // }
    // else if (!validateToken(req.headers.authorization)){
    //   return res.status(401).send(JSON.stringify({
    //     type: 'error',
    //     message: '验证过期',
    //     status: 0,
    //     data: []
    //   }))
    // }
    // 校验信息
    userModel.find({ email: req.body.email }, function (err, ret) {
      if (err) {
        res.send({
          type: 'error',
          message: '账号不存在',
          status: 0,
          data: []
        })
      }
      else {
        console.log('ret', ret);
        // console.log('验证结果', Bcrypt.untieSalt(req.body.password, ret[0].password))
        if (ret.length !== 0 && Bcrypt.untieSalt(req.body.password, ret[0].password)) {
          // 生成token
          let token = createToken({ name: req.body.email });
          res.send({
            type: 'success',
            message: '登录成功',
            status: 1,
            data: {
              name: req.body.email,
              token
            }
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
        password: Bcrypt.genSalt(req.body.password),
        gender: req.body.gender,
        age: req.body.age,
        email: req.body.email,
        status: 0,
        date: new Date(),
        code: randomCode
      })
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
   * 邮箱验证
   * @param {Object} req 
   * @param {Object} res 
   */
  checkMail(req, res) {
    // console.log('checkMail', req);
    // console.log('startTime', req._startTime)
    userModel.findOne({ email: req.query.account }, function(err, ret) {
      if (err) {
        res.json({
            status: 0,
            success: false,
            message: '邮箱不存在！',
            data:[]
        })
      }
      // console.log('ret', ret)
      if (ret) {
        if (ret.status === 1) {
            res.json({
                status: 0,
                success: false,
                message: '该邮箱已激活,请不要重复验证！',
                data:[]
            })
        }
        else if (req.query.code === ret.code) {
          console.log('验证码正确')
          console.log('date', new Date(req._startTime) - new Date(ret.date))
          if (new Date(req._startTime) - new Date(ret.date) < 900000) {
            // 验证时间小于15min
            userModel.update({ email: ret.email }, { status: 1}, function(updateErr, updateRet) {
              if (updateErr) {
                res.json({
                    status: 0,
                    success: false,
                    message: '更新失败!',
                    data:[]
                })
              }
              console.log('注册成功')
              // res.json({
              //     status: 1,
              //     success: true,
              //     message: '注册成功!',
              //     data:[]
              // })
              res.redirect('http://localhost:9000/WeUniv/login', 301);
            })
          }
          else {
            res.json({
              status: 0,
              success: false,
              message: '验证超时,请重新注册！',
              data:[]
          })
          }
        } 
        else {
          res.json({
              status: 0,
              success: false,
              message: '验证码出错,请重新注册！',
              data:[]
          })
        }
      } 
      else {
        // TODO:验证code和时间
        
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
          // 存在已激活
          res.json({
              success: false,
              message: '该用户已注册！',
              data:[]
          })
        }
        else {
          // 存在未激活
          res.json({
              success: false,
              message: '该用户未激活邮箱！',
              data:[]
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