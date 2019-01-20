/**
 * 密码加密和解密
 */
const bcrypt = require('bcryptjs');

class Bcrypt {
  genSalt(pwd) {
    console.log('pwd', pwd);
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(pwd,salt);
      return hash;
    } catch (error) {
      console.log('error', error);
      return false;
    }
    // bcrypt.genSaltSync(10, function (err, salt) {
    //   if (err) {
    //     return false;
    //   }
    //   bcrypt.hash(pwd, salt, function (err, hash) {
    //     if (err) {
    //       return false;
    //     }
    //     console.log('加盐成功', hash);
    //     return hash;
    //   })
    // });
  }
  /**
   * 
   * @param { String } pwd url传递的密码
   * @param { String } hash 数据库中的密码
   */
  untieSalt(pwd, hash) {
    try {
      if (bcrypt.compareSync(pwd, hash)) {
        console.log('密码匹配');
        return true;
      }
      else {
        console.log('密码不匹配');
        return false;
      }
    } catch (error) {
      console.log('error', error);
      return false;
    }
    // bcrypt.compare(pwd, hash).then((res) => {
    //   if (res) {
    //     console.log('密码匹配');
    //     return true;
    //   }
    //   else {
    //     return false;
    //   }
    // });
  }
}
module.exports = new Bcrypt();