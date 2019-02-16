const config = require('../../config/index');
const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const formidable = require('formidable');
const qiniu = require('qiniu');
const stream = require('stream');
const request = require('request');

// 根据ak、sk返回token
function getUploadToken () {
  let mac = new qiniu.auth.digest.Mac(config.qiniu.accessKey, config.qiniu.secretKey);
  let options = {
    scope: config.qiniu.bucket,
    expires: 7200 // 超时两小时
  }
  let putPolicy = new qiniu.rs.PutPolicy(options);
  // 获取并返回uploadtoken
  return putPolicy.uploadToken(mac);
}
class Article {
  // 文章提交 上传七牛云 保存链接 保存数据库
  addArticleContent (req, res) {
    let putExtra = new qiniu.form_up.PutExtra();
    let qiniuconfig = new qiniu.conf.Config();
    qiniuconfig.zone = qiniu.zone.Zone_z2; // 空间对应的机房
    let formUploader = new qiniu.form_up.FormUploader(qiniuconfig);
    let key = Date.parse(req.body.public_date) + '.html'; // 生成独一无二的文件名 最好还是用时间戳来保存
    let uploadToken = getUploadToken();
    formUploader.put(uploadToken, key, req.body.content, putExtra, function (respErr,
      respBody, respInfo) {
      if (respErr) {
        console.log('respErr', respErr);
        res.json({
          success: false,
          message: '上传出错,请重试'
      })
      }
      if (respInfo.statusCode == 200) {
        console.log('上传成功url', 'http://' + config.qiniu.addr + '/' + respBody.key)
        const newArticle = new articleModel({
          title: req.body.title,
          type: req.body.type,
          content: 'http://' + config.qiniu.addr + '/' + respBody.key,
          status: 0,
          tag: 'public',
          public_time: req.body.public_date,
          author: req.body.userid
        })
        newArticle.save(function(err) {
          if (err) {
            res.json({
                success: false,
                message:'添加失败'
            })
          }
          else {
            // 通过newArticle来拿到刚添加的_id
            userModel.update({ _id: req.body.userid }, { $push: { article: newArticle._id } }, (err) => {
              if (err) {
                res.json({
                    success: false,
                    message:'用户信息更新失败'
                })
              }
              res.json({
                  success: true,
                  message:'保存成功'
              })
            })
          }
        })
      } else {
        res.json({
            success: false,
            message:'上传失败'
        })
      }
    })
  }
  // 获取文章信息
  async getArticleInfo(req, res, next) {
    // 多条件查询
    let article = await articleModel.findOne({'author': req.body.authorid, 'public_time': req.body.time});
    if(!article.content) {
      res.json({
        success: false,
        message:'文章获取失败'
      })
    }
    // 请求七牛云资源url获取文章内容
    request(article.content, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.json({
            success: true,
            message:'查询成功',
            data: {
              title: req.body.title,
              author: req.body.author,
              content: body
            }
        })
      }
      else {
        res.json({
            success: false,
            message:'查询失败'
        })
      }
    })
  }
  // 图片上传
  uploadArticlePic(req, res) {
    // 需要使用formidable来帮助拿到上传数据
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      console.log('req', req);
      console.log('fields', fields);
      console.log('files', files);
      let base64str = fields.url.replace('data:image/png;base64,', '');
      // Base64转为字节数组上传
      let buff = new Buffer(base64str, 'base64');
      let bufferStream = new stream.PassThrough();
      bufferStream.end(buff);
      bufferStream.pipe(process.stdout)
      // TODO:改为异步上传,参考:https://www.cnblogs.com/fayin/p/6855922.html

      let putExtra = new qiniu.form_up.PutExtra();
      let qiniuconfig = new qiniu.conf.Config();
      qiniuconfig.zone = qiniu.zone.Zone_z2; // 空间对应的机房
      let formUploader = new qiniu.form_up.FormUploader(qiniuconfig);
      let key = files.upload.name;
      let uploadToken = getUploadToken();
      // TODO:改为异步上传,参考:https://www.cnblogs.com/fayin/p/6855922.html
      formUploader.putStream(uploadToken, key, bufferStream, putExtra, function (respErr,
        respBody, respInfo) {
        if (respErr) {
          throw respErr;
        }
        if (respInfo.statusCode == 200) {
          res.json({
              success: true,
              message:'上传成功',
              data: {
                url: 'http://' + config.qiniu.addr + '/' + respBody.key
              }
          })
        } else {
          res.json({
              success: false,
              message:'上传失败'
          })
        }
      })
    })
  }
}

module.exports = new Article();