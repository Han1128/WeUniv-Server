const config = require('../../config/index');
const userModel = require('../../models/user/user');
const tagModel = require('../../models/tag/tag');
const articleModel = require('../../models/article/article');
const R = require('ramda');

class Admin {
  // 热门文章查询
  async addTopicTags(req, res, next) {
    try {
      const newTag = new tagModel({
        iconCode: req.body.code,
        iconLabel: req.body.label
      })
      await newTag.save();
      res.json({
          success: true,
          message:'添加成功'
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

module.exports = new Admin();
