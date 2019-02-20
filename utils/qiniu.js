/**
 * 七牛云上传
 */
const config = require('../config/index');
const qiniu = require('qiniu');
const fs = require('fs')

class Qiniu {
  constructor (accessKey, secretKey) {
      this.ak = accessKey
      this.sk = secretKey
      this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
      this.putExtra = new qiniu.form_up.PutExtra()
  }
  // 根据ak、sk返回token
  getUploadToken () {
    // let mac = new qiniu.auth.digest.Mac(config.qiniu.accessKey, config.qiniu.secretKey);
    let options = {
      scope: config.qiniu.bucket,
      force: true, // 强制替换同名文件
      expires: 7200, // 超时两小时
      fsizeMin: 1 // 最小限制
    }
    let putPolicy = new qiniu.rs.PutPolicy(options);
    // 获取并返回uploadtoken
    return putPolicy.uploadToken(this.mac);
  }
  getFormLoader () {
    let qiniuconfig = new qiniu.conf.Config();
    qiniuconfig.zone = qiniu.zone.Zone_z2; // 空间对应的机房
    return new qiniu.form_up.FormUploader(qiniuconfig);
  }
  uploadReTry(key, content) {
    let formUploader = this.getFormLoader();
    let putExtra =new qiniu.form_up.PutExtra(); // 如果两个文件同时上传调用这个函数必须保证putExtra不一样
    return new Promise((resolve, reject) => {
      formUploader.put(this.getUploadToken(), key, content, putExtra, function (respErr,
        respBody, respInfo) {
        if (respErr) reject(respErr);
        if (respInfo.statusCode == 200) {
          resolve('http://' + config.qiniu.addr + '/' + encodeURI(respBody.key))
        } else {
         reject(respInfo)
        }
      })
    })
  }
  // uploadReTry(key, filePath) {
  //   let formUploader = this.getFormLoader();
  //   let putExtra =new qiniu.form_up.PutExtra();
  //   return new Promise((resolve, reject) => {
  //     formUploader.putFile(this.getUploadToken(), key, filePath, putExtra, function (respErr,
  //       respBody, respInfo) {
  //       if (respErr) reject(respErr);
  //       if (respInfo.statusCode == 200) {
  //         fs.unlinkSync(filePath);
  //         resolve('http://' + config.qiniu.addr + '/' + encodeURI(respBody.key))
  //       } else {
  //       reject(respInfo)
  //       }
  //     })
  //   })
  // }
}

module.exports = new Qiniu(config.qiniu.accessKey, config.qiniu.secretKey);