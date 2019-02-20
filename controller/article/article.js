const config = require('../../config/index');
const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const Qi = require('../../utils/qiniu');
const request = require('request');
const R = require('ramda');

class Article {
  // 文章提交 上传七牛云 保存链接 保存数据库
  async addArticleContent (req, res, next) {
    try {
      let articleKey = req.body.title + Date.parse(req.body.public_date) + '.html'; // 生成独一无二的文件名 最好还是用时间戳来保存
      let articleUrl = await Qi.uploadReTry(articleKey, req.body.content);
      let bgUrl = '';
      if (req.body.coverBg !== '') {
        let bgKey = req.body.title + Date.parse(req.body.public_date) + 'bg.' + req.body.bgType;
        let base64str = req.body.coverBg.replace('data:image/png;base64,', '');
        let buff = new Buffer(base64str, 'base64');
        bgUrl = await Qi.uploadReTry(bgKey, buff);
      }
      let coverBgArr = [];
      coverBgArr.push(bgUrl);
      debugger
      const newArticle = new articleModel({
        title: req.body.title,
        type: req.body.type,
        content: articleUrl,
        status: 0,
        tag: 'public',
        public_time: req.body.public_date,
        author: req.body.userid,
        coverBg: coverBgArr,
        viewsTime: req.body.viewsTime,
        isTop: req.body.isTop,
      })
      await newArticle.save();
      await userModel.update({ _id: req.body.userid }, { $push: { article: newArticle._id } });
      res.json({
          success: true,
          message:'保存成功',
          data: {
            articleid: newArticle._id
          }
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'用户信息更新失败',
          error
      })
    }


    // formUploader.put(uploadToken, key, req.body.content, Qi.putExtra, function (respErr,
    //   respBody, respInfo) {
    //   if (respErr) {
    //     res.json({
    //       success: false,
    //       message: '上传出错,请重试'
    //   })
    //   }
    //   if (respInfo.statusCode == 200) {
    //     // console.log('上传成功url', 'http://' + config.qiniu.addr + '/' + respBody.key)
    //     // 创建文章对象
    //     const newArticle = new articleModel({
    //       title: req.body.title,
    //       type: req.body.type,
    //       content: 'http://' + config.qiniu.addr + '/' + respBody.key,
    //       status: 0,
    //       tag: 'public',
    //       public_time: req.body.public_date,
    //       author: req.body.userid,
    //       coverBg: '',
    //       viewsTime: req.body.viewsTime,
    //       isTop: req.body.isTop,
    //     })
    //     newArticle.save(function(err) {
    //       if (err) {
    //         res.json({
    //             success: false,
    //             message:'添加失败'
    //         })
    //       }
    //       else {
    //         // 通过newArticle来拿到刚添加的_id
    //         userModel.update({ _id: req.body.userid }, { $push: { article: newArticle._id } }, (err) => {
    //           if (err) {
    //             res.json({
    //                 success: false,
    //                 message:'用户信息更新失败'
    //             })
    //           }
    //           res.json({
    //               success: true,
    //               message:'保存成功'
    //           })
    //         })
    //       }
    //     })
    //   } else {
    //     res.json({
    //         success: false,
    //         message:'上传失败'
    //     })
    //   }
    // })
  }
  // 说说提交
  async addShortArticle(req, res, next) {
    try {
      let bgArr = []; // 存放图片集合
      let bgUrl = ''; // 临时存放上传url
      if (req.body.coverBg !== '') {
        for (let index = 0;index < req.body.coverBg.length; index++) {
          let bgKey = '文章图' + req.body.username + Date.parse(new Date()) + index + '.png';
          let base64str = req.body.coverBg[index].replace('data:image/png;base64,', '');
          let buff = new Buffer(base64str, 'base64');
          bgUrl = await Qi.uploadReTry(bgKey, buff);
          bgArr.push(bgUrl);
        }
      }
      debugger
      const newArticle = new articleModel({
        title: '',
        type: 'short',
        content: req.body.content,
        status: 0,
        tag: '说说',
        public_time: new Date(),
        author: req.body.userId,
        coverBg: bgArr,
        viewsTime: 0,
        isTop: req.body.isTop,
      })
      await newArticle.save(); // 保存文章
      await userModel.update({ _id: req.body.userId }, { $push: { article: newArticle._id } });
      res.json({
        success: true,
        message:'文章提交成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
        success: false,
        message:'文章提交失败,请重试'
      })
    }
  }
  // 获取指定文章信息(单个查询)
  async getDesignArticle(req, res, next) {
    let article = await articleModel.findOne({'_id': req.query.articleId});
    request(article.content, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.json({
            success: true,
            message:'查询成功',
            data: {
              articleContent: body
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
  // 查询文章内容
  async getArticleContent(req, res, next) {
    try {
      let result = await articleModel.findOne({ '_id': req.query.articleId }).populate('author')
      // 请求七牛云资源url获取文章内容
      request(result.content, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.json({
              success: true,
              message:'查询成功',
              data: {
                userData: result.author,
                title: result.title,
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
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '文章查询失败,请稍后重试'
      })
    }
  }
  // 获取用户全部文章信息
  async getUserArticles(req, res, next) {
    try {
      let result = await articleModel.find({ 'author': req.query.userid }).populate('author')
      let turnResult = R.map(val => {
        let valObj = val.toObject();
        let authorObj = R.pick(['_id', 'username', 'avatar'])(valObj.author);
        authorObj._id = authorObj._id.toString();
        valObj.author = authorObj;
        return valObj
      })(result)
      res.send({
        success: true,
        message: '文章查询成功',
        data: {
          result: turnResult
        }
      })
    } catch (error) {
      res.send({
        success: false,
        message: '文章查询失败,请稍后重试'
      })
    }
  }
}

module.exports = new Article();