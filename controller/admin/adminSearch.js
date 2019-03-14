const config = require('../../config/index');
const mongoose = require('../../mongodb/db');
const Bcrypt = require('../../utils/pwdbcrypt');
const userModel = require('../../models/user/user');
const tagModel = require('../../models/tag/tag');
const schoolModel = require('../../models/user/school');
const followModel = require('../../models/follow/follow');
const articleModel = require('../../models/article/article');
const messageModel = require('../../models/message/message');
const commentionModel = require('../../models/Interaction/comment');
const R = require('ramda');

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
  // 概况统计数据
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
}

module.exports = new AdminSearch();
