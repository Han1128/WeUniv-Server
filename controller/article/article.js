const config = require('../../config/index');
const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const Qi = require('../../utils/qiniu');
const request = require('request');
const R = require('ramda');

async function getArticle(condition = {}, sort = {'public_time': -1}) {
  return await articleModel.find(condition)
  .populate({
    path: 'author',
    model: 'user',
    select: {
      _id: 1,
      username: 1,
      avatar: 1,
      like_article: 1,
      like_comment: 1,
      collect: 1
    }
  }).populate({
    path: 'commentFrom', // article中的关联名 不是关联文档的model名
    model: 'comment', // model代表ref连接的文档名
    populate: {
      path: 'from_author',
      model: 'user',
      select: { // select内容中1表示要选取的部分 0代表不选取
        _id: 1, 
        username: 1,
        avatar: 1,
        like_article: 1,
        like_comment: 1
      }
    }
  }).populate({
    path: 'commentFrom', // article中的关联名 不是关联文档的model名
    model: 'comment', // model代表ref连接的文档名
    populate: {
      path: 'from_comment',
      model: 'comment',
      populate: {
        path: 'from_author',
        model: 'user',
        select: { // select内容中1表示要选取的部分 0代表不选取
          _id: 1, 
          username: 1,
          avatar: 1,
          like_article: 1,
          like_comment: 1
        }
      }
    }
  }).sort(sort);
}
class Article {
  // 文章提交 上传七牛云 保存链接 保存数据库
  async addArticleContent (req, res, next) {
    try {
      let articleKey = req.body.title + Date.parse(req.body.public_date) + '.html'; // 生成独一无二的文件名 最好还是用时间戳来保存
      let articleUrl = await Qi.uploadReTry(articleKey, req.body.content);
      let bgUrl = '';
      if (req.body.coverBg !== '') {
        let bgKey = req.body.title + Date.parse(req.body.public_date) + 'bg.png';
        let base64str = req.body.coverBg.replace('data:image/png;base64,', '');
        let buff = new Buffer(base64str, 'base64');
        bgUrl = await Qi.uploadReTry(bgKey, buff);
      }
      let coverBgArr = [];
      coverBgArr.push(bgUrl);
      const newArticle = new articleModel({
        title: req.body.title,
        type: req.body.type,
        content: articleUrl,
        text: req.body.text,
        status: 0,
        tag: req.body.tags,
        public_time: req.body.public_date,
        author: req.body.userId,
        coverBg: coverBgArr,
        viewsTime: req.body.viewsTime,
        isTop: req.body.isTop,
      })
      await newArticle.save();
      if (req.body.isTop) {
        // 设置置顶
        if (req.body.topId) {
          // 如果已经有置顶文章 将置顶文章setTop设置为false
          await articleModel.update({ 
            _id: req.body.topId 
          }, { 
            'isTop': false
          });
        }
        await userModel.update({ 
          _id: req.body.userId 
        }, { 
          $push: { article: newArticle._id }, 
          'topArticle': newArticle._id
        });
      }
      else {
        await userModel.update({ _id: req.body.userId }, { $push: { article: newArticle._id } });
      }
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
  }
  // 文章编辑
  async articleEdit(req, res, next) {
    try {
      // 先获取原有内容
      const oldResult = await articleModel.findOne({'_id': req.body.articleId});
      // 上传资源
      // 先上传图片
      let bgUrl = '';
      let coverBgArr = [];
      if (req.body.coverBg !== '' && req.body.coverBg !== oldResult.coverBg[0]) {
        // 上传背景图
        let bgKey = req.body.title + Date.parse(req.body.update_time) + 'bg.png';
        let base64str = req.body.coverBg.replace('data:image/png;base64,', '');
        let buff = new Buffer(base64str, 'base64');
        bgUrl = await Qi.uploadReTry(bgKey, buff);
        coverBgArr.push(bgUrl);
      }
      // 再上传文章
      let articleKey = req.body.title + Date.parse(req.body.update_time) + '.html'; // 生成独一无二的文件名 最好还是用时间戳来保存
      let articleUrl = await Qi.uploadReTry(articleKey, req.body.content);

      //再删除旧文章
      let contentArr = oldResult.content.split('/');
      let contentKey = contentArr[contentArr.length - 1];
      contentKey = decodeURI(contentKey);
      await Qi.deleteFromQiniu(contentKey);
      if (oldResult.coverBg[0] && req.body.coverBg !== oldResult.coverBg[0]) {
        // 再删除旧图
        let bgArr = oldResult.coverBg[0].split('/');
        let bgKey = bgArr[bgArr.length - 1];
        bgKey = decodeURI(bgKey);
        await Qi.deleteFromQiniu(bgKey);
      }
      // 一次更新多条
      await articleModel.update({
        '_id': req.body.articleId
      },{$set: {
        'title': req.body.title, 
        'content': articleUrl, 
        'text': req.body.text,
        'tag': req.body.tags, 
        'update_time': req.body.update_time,
        'coverBg': req.body.coverBg === oldResult.coverBg[0] ? req.body.coverBg : coverBgArr,
        'viewsTime': 1,
        'isTop': req.body.isTop
      }});
      if (req.body.isTop) {
        // 设置置顶
        if (req.body.topId) {
          // 如果已经有置顶文章 将置顶文章setTop设置为false
          await articleModel.update({ 
            _id: req.body.topId 
          }, { 
            'isTop': false
          });
        }
        await userModel.update({ 
          _id: req.body.userId 
        }, { 
          'topArticle': req.body.articleId
        });
      }
      else if (req.body.topId == req.body.articleId) {
        // 置顶文章设置为不置顶
        await userModel.update({ 
          _id: req.body.userId 
        }, { 
          'topArticle': ''
        });
      }
      res.json({
          success: true,
          message:'更新成功',
          data: {
            articleid: req.body.articleId
          }
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'文章信息更新失败'
      })
    }
  }
  async articleDelete(req, res) {
    try {
      // 查询删除文章和背景
      const result = await articleModel.findOne({
        '_id': req.body.articleId
      });
      // 删除七牛云资源
      let contentArr = result.content.split('/');
      let contentKey = contentArr[contentArr.length - 1];
      contentKey = decodeURI(contentKey);
      await Qi.deleteFromQiniu(contentKey);
      if (result.coverBg[0]) {
        let bgArr = result.coverBg[0].split('/');
        let bgKey = bgArr[bgArr.length - 1];
        bgKey = decodeURI(bgKey);
        await Qi.deleteFromQiniu(bgKey);
      }
      // 删除用户表的数据
      await userModel.update({
        _id: result.author 
      }, { 
        $pull: {
          'article': result._id
        }
      });
      // 删除文章
      await articleModel.remove({'_id': result._id});
      res.json({
          success: true,
          message:'删除成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'文章删除失败'
      })
    }
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
      if (req.body.isTop) {
        // 设置置顶
        if (req.body.topId) {
          // 如果已经有置顶文章 将置顶文章setTop设置为false
          await articleModel.update({ 
            _id: req.body.topId 
          }, { 
            'isTop': false
          });
        }
        await userModel.update({ 
          _id: req.body.userId 
        }, { 
          $push: { article: newArticle._id }, 
          'topArticle': newArticle._id
        });
      }
      else {
        await userModel.update({ _id: req.body.userId }, { $push: { article: newArticle._id } });
      }
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
    try {
      let article = await getArticle({
        '_id': req.query.articleId
      }, {});
      request(article[0].content, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let result = article[0].toObject();
          result.content = body;
          res.json({
              success: true,
              message:'查询成功',
              data: {
                result
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
      let result = await getArticle({ 
        'author': req.query.userid 
      }, {
        'isTop': -1,'public_time': -1
      });
      res.send({
        success: true,
        message: '文章查询成功',
        data: {
          result
        }
      })
    } catch (error) {
      res.send({
        success: false,
        message: '文章查询失败,请稍后重试'
      })
    }
  }
  // 按需求查询数据库中对应的所有文章
  async getHomePageArticle(req, res, next) {
    try {
      // 多层关联查询
      let result = await getArticle({ 
        'commentFrom.0': { $exists: true } // 查询评论数大于1的文章
      });
      res.send({
        success: true,
        message: '文章查询成功',
        data: {
          result
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
  // 点击标签查找文章
  async getArticleByTag (req, res, next) {
    try {
      let result = await getArticle({ 
        "$or": [{
          'title': new RegExp(req.query.tagLabel, "i")
        }, {
          'text': new RegExp(req.query.tagLabel, "i")
        }, {
          'tag': new RegExp(req.query.tagLabel, "i")
        }]
        // 查询评论数大于1的文章
      });
      res.send({
        success: true,
        message: '文章查询成功',
        data: {
          result
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
  // 根据日期间隔查询内容返回
  async getNewestArticle(req, res, next) {
    try {
      // 多层关联查询
      const result = await getArticle({ "public_time" : { 
        "$gte" : new Date(req.query.time).toISOString()
      } }, {
        'like_num': -1, 'collect_num': -1
      });
      res.send({
        success: true,
        message: '文章查询成功',
        data: {
          result
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
  // 查询所有记录
  async getHomeNewestArticle(req, res, next) {
    try {
      let result = await getArticle();
      res.send({
        success: true,
        message: '文章查询成功',
        data: {
          result
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
  // 获取用户的相册
  async getUserGallery(req, res, next) {
    try {
      const result = await articleModel.find({
        author: req.query.userId
      }, {
        type: 1, coverBg: 1, public_time: 1, likeBy: 1, collectBy: 1
      });
      res.json({
          success: true,
          message:'查询成功',
          result
      })
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '用户照片获取失败'
      })
    }
  }
}

module.exports = new Article();