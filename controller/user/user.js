const userModel = require('../../models/user/user');
const config = require('../../config/index');
const jwt = require('jsonwebtoken');
const passport = require('passport');

function createToken (data) {
  let token = jwt.sign(data, config.secret,{
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
class User {
  userLogin (req, res) {
    userModel.find({ email: req.body.email }, function (err, ret) {
      if (err) {
        console.log('查询失败');
      }
      else {
        console.log('ret', ret);
        if (ret.length !== 0) {
          // return res.status(200).send(JSON.stringify({
          //   code: 0,
          //   data: [],
          //   success: true,
          //   message: "Success"
          // }))
          // 生成token
          let token = createToken({ name: req.body.email });
          res.send({
            type: 'success',
            message: '登录成功',
            status: 1,
            data: {
              id: req.body.id,
              name: '张三哈哈哈',
              token
            }
          })
        }
        else {
          res.send({
            type: 'error',
            message: '账号或密码出错',
            status: 0,
            data: []
          })
        }
      }
    })
  }
  userRegister (req, res) {
    const newUser = new userModel({
      name: req.body.username,
      password: req.body.password,
      gender: req.body.gender,
      age: req.body.age,
      email: req.body.email
    })
    newUser.save(function(err) {
      if (err) {
        console.error('添加失败' + err);
        res.json({
            status:0,
            message:'添加失败',
            data:[]
        })
      }
      else {
        res.json({
            status:1,
            message:'添加成功',
            data:[]
        })
      }
    })
  }
}

module.exports = new User()