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

class AdminUpdate {
  // 添加标签/话题
  async addTopicTags(req, res, next) {
    try {
      await tagModel.findOneAndUpdate(
        {iconCode: req.body.iconCode}, 
        {$set: {'iconCode': req.body.iconCode, 'iconLabel': req.body.iconLabel}}, 
        {upsert: true}
      )
      // const newTag = new tagModel({
      //   iconCode: req.body.code,
      //   iconLabel: req.body.label
      // })
      // await newTag.save();
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
  // 管理员更新用户信息
  async updateUserByAdmin(req, res, next) {
    try {
      await userModel.findOneAndUpdate(
        {
          _id: req.body.userId
        }, 
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            userType: req.body.userType,
            password: Bcrypt.genSalt(req.body.password),
            gender: req.body.gender
          }
        }
      )
      
      res.json({
          success: true,
          message: '添加成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'添加失败'
      })
    }
  }
  // 强制修改密码
  async resetPwdByAdmin(req, res, next) {
    try {
      await userModel.update({
        _id: req.body.userId
      }, {
        password: Bcrypt.genSalt(req.body.password)
      })
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'修改失败'
      })
    }
  }
  // 添加推荐文章
  async addToHomeRecommend(req, res, next) {
    try {
      await adminSetModel.update({
        _id: '5c89b40fbae324b5b5dc900d',
      }, {
        $push: {
          recommendList: {
            $each : [].concat(req.body.articleId),
            $position: 0
          }
        }
      })
      await adminSetModel.update({
        _id: '5c89b40fbae324b5b5dc900d',
      }, {
        $pop: {
          recommendList: 1
        }
      })
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      res.json({
          success: false,
          message:'修改失败'
      })
    }
  }
  // 添加推荐用户
  async addToRecommendUser(req, res, next) {
    try {
      // 先加再删
      await adminSetModel.update({
        _id: '5c89b40fbae324b5b5dc900d',
      }, {
        $push: {
          recommendUser: {
            $each : [].concat(req.body.userId),
            $position: 0
          }
        }
      })
      await adminSetModel.update({
        _id: '5c89b40fbae324b5b5dc900d',
      }, {
        $pop: {
          recommendUser: 1
        }
      })
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      res.json({
          success: false,
          message:'修改失败'
      })
    }
  }
  // 添加轮播
  async addToHomeSwiper(req, res, next) {
    try {
      // 先加再删
      await adminSetModel.update({
        _id: '5c89b40fbae324b5b5dc900d',
      }, {
        $push: {
          swiperList: {
            $each : [].concat(req.body.articleId),
            $position: 0
          }
        }
      })
      await adminSetModel.update({
        _id: '5c89b40fbae324b5b5dc900d',
      }, {
        $pop: {
          swiperList: 1
        }
      })
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'修改失败'
      })
    }
  }
  // 删除评论
  async deleteComment(req, res, next) {
    try {
      await commentionModel.update({
        _id: req.body.commentId  
      }, {
        isEffect: false
      })
      await articleModel.update({
        'commentFrom': {
          $in: req.body.commentId 
        }
      }, {
        $inc: { 'comment_num': -1 }
      })
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'删除失败'
      })
    }
  }
  // 删除评论
  async deleteArticle(req, res, next) {
    try {
      await articleModel.update({
        _id: req.body.articleId  
      }, {
        status: req.body.status
      })
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      res.json({
          success: false,
          message:'修改失败'
      })
    }
  }
  // 管理员配置初始化
  async addAdminSet(req, res, next) {
    try {
      const newAdminSet = new adminSetModel({
        updateTime: new Date(),
        setBy: req.body.adminId
      })
      await adminSetModel.create(newAdminSet);
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
  /************ 更新测试域名 **************/
  // 更新背景图
  async updateQiniuBgUrl(req, res, next) {
    try {
      let allBgUrl = await articleModel.find({
        'coverBg.0': { $exists: true }
      }, {
        id: 1,
        coverBg: 1
      });
      for (let item of allBgUrl) {
        let arr = [];
        for (let val of item.coverBg) {
          arr.push(val.replace('http://pnybr76es.bkt.clouddn.com/', 'http://pp6ab9tdt.bkt.clouddn.com/'))
        }
        await articleModel.update({
          _id: item.id
        }, {
          coverBg: arr
        });
      }
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'修改失败'
      })
    }
  }
  // 更新内容
  async updateQiniuContentUrl(req, res, next) {
    try {
      let allUrl = await articleModel.find({
        type: 'long'
      }, {
        id: 1,
        content: 1
      });
      for (let item of allUrl) {
        // 更新content
        let newContent = item.content.replace('http://pnybr76es.bkt.clouddn.com/', 'http://pp6ab9tdt.bkt.clouddn.com/')  
        await articleModel.update({
          _id: item.id
        }, {
          content: newContent
        });
      }
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'修改失败'
      })
    }
  }
  // 更新头像
  async updateQiniuAvatarUrl(req, res, next) {
    try {
      let allUser = await userModel.find({}, {
        avatar: 1
      });
      for (let item of allUser) {
        let newAvatar = '';
        if (item.avatar) {
          newAvatar = item.avatar.replace('http://pnybr76es.bkt.clouddn.com/', 'http://pp6ab9tdt.bkt.clouddn.com/')  
        }
        await userModel.update({
          _id: item._id
        }, {
          avatar: newAvatar
        });
      }
      res.json({
          success: true,
          message:'修改成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'修改失败'
      })
    }
  }
}

module.exports = new AdminUpdate();
