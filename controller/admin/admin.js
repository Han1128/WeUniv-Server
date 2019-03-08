const config = require('../../config/index');
const mongoose = require('../../mongodb/db');
const Bcrypt = require('../../utils/pwdbcrypt');
const userModel = require('../../models/user/user');
const tagModel = require('../../models/tag/tag');
const schoolModel = require('../../models/user/school');
const followModel = require('../../models/follow/follow');
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
  // 管理员不通过邮箱验证直接添加用户
  async addUserByAdmin(req, res, next) {
    try {
      const newObjectId = mongoose.Types.ObjectId();
      const newUser = new userModel({
        username: req.body.username,
        email: req.body.email,
        userType: req.body.userType,
        password: Bcrypt.genSalt(req.body.password),
        gender: req.body.gender,
        birth: req.body.birth,
        token: '',
        status: 1,
        follow: newObjectId,
        schoolData: newObjectId,
        topArticle: '',
        createTime: new Date()
      })
      await userModel.create(newUser);

      const newSchoolData = new schoolModel({
        _id: newObjectId,
        author: newUser._id
      })
      await newSchoolData.save();
      const newFollow = new followModel({
        _id: newObjectId,
        author: newUser._id,
        following_num: 0,
        follower_num: 0
      })
      await followModel.create(newFollow);
      
      res.json({
          success: true,
          message: '用户添加成功'
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
