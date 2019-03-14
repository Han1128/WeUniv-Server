const config = require('../../config/index');
const userModel = require('../../models/user/user');
const tagModel = require('../../models/tag/tag');
const articleModel = require('../../models/article/article');
const R = require('ramda');

class Search {
  // 模糊查询
  async blurrySearch (req, res, next) {
    try {
      let userResult = await userModel.find({
        "$or": [{
          "username" : new RegExp(req.body.condition, "i")
        }, {
          "hobby_tags" : new RegExp(req.body.condition, "i")
        }]
      }, {
        token: 0, status: 0, password: 0
      }).populate('follow').limit(5);
      let articleResult = await articleModel.find({
        "$or": [{
          'title': new RegExp(req.body.condition, "i")
        }, {
          'text': new RegExp(req.body.condition, "i")
        }, {
          'tag': new RegExp(req.body.condition, "i")
        }]
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
      }).sort({'public_time': -1}).limit(10);
      res.json({
          success: true,
          message:'查询成功',
          userResult: userResult,
          article: articleResult
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'文章删除失败'
      })
    }
  }
  // 热门文章查询
  async getHotArticleList(req, res, next) {
    try {
      const result = await articleModel.find({
        "$or": [{
          'likeBy.3': { $exists: true }
        }, {
          'collectBy.3': { $exists: true }
        }, {
          'commentFrom.3': { $exists: true }
        }]
      });
      res.json({
          success: true,
          message:'查询成功',
          result: result
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'文章查询失败'
      })
    }
  }
  // 查询推荐内容 tag相关,不包含用户文章
  async getRecommendArticle(req, res, next) {
    try {
      let result = await articleModel.find({
        'tag': {
          $in: req.query.tag // tag为用户选择的tag
        }, $nor: [{ 
          'author': req.query.userId 
        },{ 
          'type': 'short'
        }]
      }).populate({
        path: 'author',
        model: 'user',
        select: {
          _id: 1,
          username: 1,
          avatar: 1
        }
      });
      res.json({
          success: true,
          message:'查询成功',
          result: result
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'文章查询失败'
      })
    }
  }
  // 查询推荐内容 tag相关,不包含用户文章
  async getRecommendUser(req, res, next) {
    try {
      let result = await userModel.find({
        'hobby_tags': {
          $in: req.body.tag // tag为用户选择的tag
        }, $nor: [{ 
          'author': req.body.userId 
        }]
      }).limit(5)
      debugger
      res.json({
          success: true,
          message:'查询成功',
          result: result
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'文章查询失败'
      })
    }
  }
}

module.exports = new Search();
