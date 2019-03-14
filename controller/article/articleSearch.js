const config = require('../../config/index');
const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const adminSetModel = require('../../models/admin/adminSet');
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
class ArticleSearch {
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
  // 查询评论数量大于多少的文章
  async getHotTalkArticle(req, res, next) {
    try {
      // 多层关联查询
      let result = await getArticle({ 
        'commentFrom.4': { $exists: true } // 查询评论数大于1的文章
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
  async getArticleByRange(req, res, next) {
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
  // 查询最新文章记录
  async getNewestArticle(req, res, next) {
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
        type: 1, coverBg: 1, public_time: 1, like_num: 1, collect_num: 1, comment_num: 1
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
  // 查询主页轮播图文章
  async getHomePageDetails(req, res, next) {
    try {
      const defaultResult = await adminSetModel.findOne({
        _id: '5c89b40fbae324b5b5dc900d'
      }, {
        swiperList: 1,
        recommendUser: 1,
        recommendList: 1
      })
      .populate({
        path: 'swiperList',
        model: 'article',
        select: {
          _id: 1,
          title: 1,
          coverBg: 1
        }
      })
      .populate({
        path: 'recommendUser',
        model: 'user',
        select: {
          username: 1,
          userType: 1,
          avatar: 1,
          article: 1
        }
      })
      // 推荐文章
      const recommendArticle = await getArticle({ 
        "$or": [
          {
            '_id': {
              "$in": defaultResult.recommendList
            }
          }, {
            "tag" : new RegExp('校', "i")
          }, {
            "comment_num" : { 
              "$gte" : 4
            }
          }, {
            "like_num" : { 
              "$gte" : 4
            }
          }
        ]
      });
      // 校内资讯
      const schoolNews = await articleModel.find({
        'tag': {
          $in: ['校内', '肇庆学院', '校内新闻'] // tag为用户选择的tag
        }, $nor: [{ 
          'type': 'short'
        }]
      }).sort({'public_time': -1}).limit(5);
      debugger
      res.json({
          success: true,
          message:'查询成功',
          data: {
            defaultResult,
            recommendArticle,
            schoolNews
          }
      })
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '主页轮播文章获取失败'
      })
    }
  }
}

module.exports = new ArticleSearch();