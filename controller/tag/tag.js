const config = require('../../config/index');
const userModel = require('../../models/user/user');
const tagModel = require('../../models/tag/tag');
const R = require('ramda');

class Tag {
  // 添加标签
  async addFollowTag(req, res, next) {
    try {
      await tagModel.update({ 'iconLabel': req.body.label }, { 
        $push: { 'follower': req.body.userId },
        $inc: { 'follower_num': 1 }
      });
      await userModel.update({ '_id': req.body.userId }, { 
        $push: { 'hobby_tags': req.body.label }
      });
      res.json({
        success: true,
        message:'添加成功'
      })
    } catch (error) {
      res.json({
        success: false,
        message:'添加失败'
      })
    }
  }
  // 移除标签
  async removeFollowTag(req, res, next) {
    try {
      await tagModel.update({ 'iconLabel': req.body.label }, { 
        $pull: { 'follower': req.body.userId },
        $inc: { 'follower_num': -1 }
      });
      await userModel.update({ '_id': req.body.userId }, { 
        $pull: { 'hobby_tags': req.body.label }
      });
      res.json({
          success: true,
          message:'添加成功'
      })
    } catch (error) {
      res.json({
          success: false,
          message:'添加失败'
      })
    }
  }
  // 查询热门标签话题
  async getAllTags(req, res, next) {
    try {
      let result = await tagModel.find({});
      res.json({
          success: true,
          message:'查询成功',
          result: result
      })
    } catch (error) {
      res.json({
          success: false,
          message:'标签获取失败'
      })
    }
  }
  // 查询热门标签话题
  async getHotTags(req, res, next) {
    try {
      let result = await tagModel.find({ "follower_num" : { 
        "$gte" : 1
      } });
      res.json({
          success: true,
          message:'查询成功',
          result: result
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'标签获取失败'
      })
    }
  }
  async getUserTags(req, res) {
    try {
      let result = await tagModel.find({
        'follower':{
          $in: req.query.userId
        }
      });
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result: result
        }
      })
    } catch (err) {
      res.send({
        success: false,
        message: '查询用户信息失败,请稍后重试'
      })
    }
  }
}

module.exports = new Tag();
