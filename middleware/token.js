const jwt = require('jsonwebtoken');
const config = require('../config/index');
const userModel = require('../models/user/user')

class Token {
  createToken (data) {
    let token = jwt.sign(data, config.secret, {
      expiresIn: 30 // 以秒为单位
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
  async checkToken ( req, res, next ) {
    const result = await userModel.findOne({ username: req.query.username })
    jwt.verify(result.token, config.secret, (err, decoded) => {
      if (err) {
        res.status(401).end();
      }
      next()
    })
  }
  validateToken(req, res) {
    // 验证token
    if (!req.headers.authorization) {
      return res.status(401).send(JSON.stringify({
        type: 'error',
        message: '未授权',
        status: 0,
        data: []
      }))
    }
    else if (!checkToken(req.headers.authorization)){
      return res.status(401).send(JSON.stringify({
        type: 'error',
        message: '验证过期',
        status: 0,
        data: []
      }))
    }
  }
}

module.exports = new Token();
