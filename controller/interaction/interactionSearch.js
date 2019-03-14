const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const commentModel = require('../../models/Interaction/comment');
const messageModel = require('../../models/message/message');
const mongoose = require('mongoose')

class InterActionSearch {
  async getUserLike(req, res, next) {
    try {
      let result = await userModel.findOne({
        '_id': req.query.authorId
      }, {
        _id: 1,
        username: 1,
        avatar: 1,
        gender: 1,
        description: 1,
        like_article: 1,
        like_comment: 1
      }).populate({
        path: 'like_article',
        model: 'article',
        select: {
          title: 1,
          type: 1,
          author: 1,
          content: 1
        },
        populate: {
          path: 'author',
          model: 'user',
          select: { // select内容中1表示要选取的部分 0代表不选取
            username: 1
          }
        }
      }).populate({
        path: 'like_comment',
        model: 'comment',
        select: {
          _id: 1,
          content: 1,
          commentTime: 1,
          from_author: 1
        },
        populate: {
          path: 'from_author',
          model: 'user',
          select: { // select内容中1表示要选取的部分 0代表不选取
            username: 1
          }
        }
      });
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result
        }
      })
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '获取用户动态失败'
      })
    }
  }
  async getUserCollect(req, res, next) {
    try {
      let result = await userModel.findOne({
        '_id': req.query.authorId
      }, {
        _id: 1,
        username: 1,
        avatar: 1,
        gender: 1,
        description: 1,
        collect: 1
      }).populate({
        path: 'collect',
        model: 'article',
        select: {
          title: 1,
          type: 1,
          author: 1,
          content: 1 
        },
        populate: {
          path: 'author',
          model: 'user',
          select: { // select内容中1表示要选取的部分 0代表不选取
            username: 1
          }
        }
      });
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result
        }
      })
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '获取用户动态失败'
      })
    }
  }
  async getUserComment(req, res, next) {
    try {
      let result = await userModel.findOne({
        '_id': req.query.authorId
      }, {
        _id: 1,
        username: 1,
        avatar: 1,
        gender: 1,
        description: 1,
        comment: 1
      }).populate({
        path: 'comment',
        model: 'comment',
        select: {
          content: 1,
          isReply: 1,
          commentTime: 1,
          from_article: 1,
          from_author: 1,
          from_comment: 1
        },
        populate: {
          path: 'from_author',
          model: 'user',
          select: { // select内容中1表示要选取的部分 0代表不选取
            username: 1
          }
        }
      }).populate({
        path: 'comment',
        model: 'comment',
        populate: {
          path: 'from_article',
          model: 'article',
          select: { // select内容中1表示要选取的部分 0代表不选取
            title: 1,
            type: 1,
            content: 1
          }
        }
      }).populate({
        path: 'comment',
        model: 'comment',
        select: {
          content: 1,
          isReply: 1,
          commentTime: 1,
          from_article: 1,
          from_author: 1
        },
        populate: {
          path: 'from_comment',
          model: 'comment',
          select: {
            content: 1
          }
        }
      });
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result
        }
      })
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '获取用户评论失败'
      })
    }
  }
  // 关注页获取用户收藏/点赞文章列表 通过article文档查找跟上面不同
  async getLikeArticle (req, res, next) {
    try {
      let result = await articleModel.find({
        '_id': {
          $in: req.query.likeList
        }
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

module.exports = new InterActionSearch();