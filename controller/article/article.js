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
      const newArticle = new articleModel({
        title: req.body.title,
        type: req.body.type,
        content: articleUrl,
        status: 0,
        tag: req.body.tags,
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
    let article = await articleModel.findOne({
      '_id': req.query.articleId
    }).populate({
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
    })
    request(article.content, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let result = article.toObject();
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
      // 多层关联查询
      let result = await articleModel.find({ 
        'author': req.query.userid 
      })
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
      }).sort({'public_time': -1});
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
      let result = await articleModel.find({ 
        'commentFrom.0': { $exists: true } // 查询评论数大于1的文章
      }).populate({
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
      }).sort({'public_time': -1});
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
}

module.exports = new Article();