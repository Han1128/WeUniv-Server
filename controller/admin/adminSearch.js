const config = require('../../config/index');
const mongoose = require('../../mongodb/db');
const Bcrypt = require('../../utils/pwdbcrypt');
const userModel = require('../../models/user/user');
const tagModel = require('../../models/tag/tag');
const schoolModel = require('../../models/user/school');
const followModel = require('../../models/follow/follow');
const articleModel = require('../../models/article/article');
const adminSetModel = require('../../models/admin/adminSet');
const messageModel = require('../../models/message/message');
const commentionModel = require('../../models/Interaction/comment');
const R = require('ramda');

async function getArticleLineData (type, gteTime, ltTime) { 
  return await articleModel.aggregate([
    {
      "$match": { 
        "type": type,
        "public_time": {
          "$gte" : gteTime,
          '$lt': ltTime
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$public_time" }
        },
        count: { $sum: 1 }
      }
    }
  ])
}

async function getLineData(type, gteTime, ltTime) {
  return await messageModel.aggregate([
    { 
      "$match": { 
        "messageType": type,
        "time": {
          "$gte" : gteTime,
          '$lt': ltTime
        }
      } 
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$time" }
        },
        count: { $sum: 1 }
      }
    }
  ])
}
class AdminSearch {
  // 获取管理员信息
  async getAdminInfo(req, res, next) {
    try {
      const adminResult = await userModel.findOne({
        _id: req.query.adminId
      }, {
        token: 0, status: 0, password: 0
      });
      res.json({
        success: true,
        message: '查询成功',
        data: {
          result: adminResult
        }
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'查询失败'
      })
    }
  }
  // 按时间间隔统计交互数据
  async getDataCount(req, res, next) {
    try {
      // TODO:后期应该加入status为1的条件
      const user = await userModel.count();
      const longArticle = await articleModel.count({type: 'long'}); 
      const shortArticle = await articleModel.count({type: 'short'});
      const like = await messageModel.count({messageType: 'like'});
      const collect = await messageModel.count({messageType: 'collect'});
      const comment = await commentionModel.count();
      const tag = await tagModel.count();

      const likeLine = await getLineData('like', new Date(new Date() - 6*24*3600*1000), new Date());
      const collectLine = await getLineData('collect', new Date(new Date() - 6*24*3600*1000), new Date());
      const commentLine = await getLineData('comment', new Date(new Date() - 6*24*3600*1000), new Date());
      res.json({
          success: true,
          message:'查询成功',
          data: {
            user,
            like,
            collect,
            comment,
            article: longArticle + shortArticle,
            shortArticle,
            longArticle,
            tag
          },
          line: {
            like: likeLine,
            collect: collectLine,
            comment: commentLine
          }
          // lineStatistics 
      })
      } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'添加失败'
      })
    }
  }
  // 用户信息管理和文章信息管理table
  async getAdminMenuList(req, res, next) {
    try {
      const recommendList = await adminSetModel.findOne({
        _id: '5c89b40fbae324b5b5dc900d'
      });
      let result;
      let count;
      if (req.query.type === 'article') {
        result = await articleModel.find({status: 1})
                .populate('author')
                .sort({'public_time': -1})
                .skip(req.query.pageNum * 10)
                .limit(10);
        count = await articleModel.find({status: 1}).count();
      }
      else if (req.query.type === 'user') {
        result = await userModel.find({})
                .populate('schoolData')
                .populate('message')
                .sort({'public_time': -1})
                .skip(req.query.pageNum * 10)
                .limit(10);
        count = await userModel.find({}).count();
      }
      else {
        result = await tagModel.find({})
                .skip(req.query.pageNum * 10)
                .limit(10);
        count = await tagModel.find({}).count();
      }
      res.json({
        success: true,
        message:'查询成功',
        data: {
          recommendList,
          result,
          count
        }
    })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'数据查询失败'
      })
    }
  }
  // 获取数据最大值
  async getMostData(req, res, next) {
    try {
      // 阅读前五
      const mostReading = await articleModel.find({status: 1}, {viewsTime: 1, title: 1})
                            .populate({
                              path: 'author',
                              model: 'user',
                              select: {
                                username: 1
                              }
                            })
                            .sort({'viewsTime': -1})
                            .limit(5);
      // 点赞前5
      const mostLike = await articleModel.find({type: 'long'}, {title: 1, like_num: 1})
                            .sort({'like_num': -1})
                            .limit(5);
      // 收藏前5
      const mostCollect = await articleModel.find({type: 'long'}, {title: 1, collect_num: 1})
                            .sort({'collect_num': -1})
                            .limit(5);
      // 热议前5
      const mostComment = await articleModel.find({}, {title: 1, comment_num: 1})
                            .sort({'comment_num': -1})
                            .limit(5);                  
      // 发文最多用户
      // const mostStudent = await userModel.find({}, {username: 1, article: 1}).sort({})
      // 最受关注用户
      const mostUser = await followModel.find({})
                            .populate({
                              path: 'author',
                              model: 'user',
                              select: {
                                username: 1
                              }
                            })
                            .sort({'follower_num':-1}).limit(1);
      // 话题关注人最多
      const mostTag = await tagModel.find({}).sort({'follower_num': -1}).limit(1);
      // debugger
      res.json({
        success: true,
        message: '查询成功',
        data: {
          mostReading,
          mostLike,
          mostCollect,
          mostComment,
          mostUser,
          mostTag
        }
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'查询失败'
      })
    }
  }
  // 文章发布曲线
  async getArticleStatistics(req, res, next) {
    try {
      const shortLine = await getArticleLineData('short' ,new Date(new Date() - 6*24*3600*1000), new Date());
      const longLine = await getArticleLineData('long' ,new Date(new Date() - 6*24*3600*1000), new Date());
      // debugger
      res.json({
          success: true,
          message:'查询成功',
          data: {
            shortLine,
            longLine,
          }
      })
      } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'添加失败'
      })
    }
  }
  // 话题列表
  async getAdminTagsList(req, res, next) {
    try {
      const result = await tagModel.find({})
      .skip(req.query.pageNum * 10)
      .limit(10);;
      const count = await tagModel.find({}).count();
      res.json({
          success: true,
          message:'查询成功',
          data: {
            result,
            count
          }
      })
    } 
    catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'添加失败'
      })
    }
  }
  // 评论列表
  async getAdminCommentsList(req, res, next) {
    try {
      // 需要将无效评论筛选掉
      const result = await commentionModel.find({})
        .populate({
          path: 'from_author',
          model: 'user',
          select: {
            username: 1
          }
        })
        .populate({
          path: 'from_article',
          model: 'article',
          select: {
            title: 1
          }
        })
        .populate({
          path: 'from_comment',
          model: 'comment'
        })
        .skip(req.query.pageNum * 10)
        .limit(10);
      const count = await commentionModel.find({}).count();
      res.json({
          success: true,
          message:'查询成功',
          data: {
            result,
            count
          }
      })
    } 
    catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'添加失败'
      })
    }
  }
}

module.exports = new AdminSearch();
