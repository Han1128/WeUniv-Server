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
class Admin {
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
          arr.push(val.replace('http://pmwdq3oa6.bkt.clouddn.com/','http://pnybr76es.bkt.clouddn.com/'))
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
        let newContent = item.content.replace('http://pmwdq3oa6.bkt.clouddn.com/','http://pnybr76es.bkt.clouddn.com/')  
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
          newAvatar = item.avatar.replace('http://pmwdq3oa6.bkt.clouddn.com/','http://pnybr76es.bkt.clouddn.com/')  
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

module.exports = new Admin();
