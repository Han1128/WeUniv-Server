const followModel = require('../../models/follow/follow');
const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');

class Follow {
  // 添加关注
  async addFllowShip(req, res) {
    try {
      await followModel.update({ 'author': req.body.userId }, { 
        $push: { 'following': req.body.followId },
        $inc: { 'following_num': 1 }
      });
      await followModel.update({ 'author': req.body.followId }, { 
        $push: { 'follower': req.body.userId },
        $inc: { 'follower_num': 1 }
      });
      res.send({
        success: true,
        message: '添加关注成功'
      })
    } catch (err) {
      console.log('err', err)
      res.send({
        success: false,
        message: '添加关注操作出错,请稍后重试'
      })
    }
  }
  async removeFollowShip(req, res) {
    try {
      await followModel.update({ 'author': req.body.userId }, { 
        $pull: { 'following': req.body.followId },
        $inc: { 'following_num': -1 }
      });
      await followModel.update({ 'author': req.body.followId }, { 
        $pull: { 'follower': req.body.userId },
        $inc: { 'follower_num': -1 }
      });
      res.send({
        success: true,
        message: '取消关注成功'
      })
    } catch (err) {
      console.log('err', err)
      res.send({
        success: false,
        message: '取消关注操作出错,请稍后重试'
      })
    }
  }
  // 获取关注者列表
  async getFollowingList(req, res, next) {
    try {
      let followResult = await followModel.findOne({
        'author': req.query.authorId
      }, {
        following_num: 1,
        following: 1,
        author: 1
      }).populate({
        path: 'author',
        model: 'user',
        select: {
          _id: 1,
          username: 1,
          avatar: 1
        }
      }).populate({
        path: 'following',
        model: 'user',
        select: {
          _id: 1,
          username: 1,
          avatar: 1,
          description: 1
        },
        populate: {
          path: 'follow',
          model: 'follow',
          select: { // select内容中1表示要选取的部分 0代表不选取
            follower_num: 1
          }
        }
      });
      res.send({
        success: true,
        message: '查询成功',
        data: {
          followResult
        }
      })
    } catch (error) {
      console.log('error', error);
      res.send({
        success: false,
        message: '取消关注操作出错,请稍后重试'
      })
    }
  }
  // 获取粉丝列表
  async getFollowerList(req, res, next) {
    try {
      let followResult = await followModel.findOne({
        'author': req.query.authorId
      }, {
        follower_num: 1,
        follower: 1,
        author: 1
      }).populate({
        path: 'author',
        model: 'user',
        select: {
          _id: 1,
          username: 1,
          avatar: 1
        }
      }).populate({
        path: 'follower',
        model: 'user',
        select: {
          _id: 1,
          username: 1,
          avatar: 1,
          description: 1
        },
        populate: {
          path: 'follow',
          model: 'follow',
          select: { // select内容中1表示要选取的部分 0代表不选取
            follower_num: 1
          }
        }
      });
      res.send({
        success: true,
        message: '查询成功',
        data: {
          followResult
        }
      })
    } catch (error) {
      console.log('error', error);
      res.send({
        success: false,
        message: '取消关注操作出错,请稍后重试'
      })
    }
  }
  // 获取相同关注
  async getCommonFollow(req, res, next) {
    try {
      const result = await userModel.find({'_id': {$in: req.query.idList}}, {
        username: 1, avatar: 1, description: 1, gender: 1
      });
      res.send({
        success: true,
        message: '查询成功',
        result: result
      })
    } catch (error) {
      console.log('error', error);
      res.send({
        success: false,
        message: '查询共同关注出错'
      })
    }
  }
  // 获取关注者的文章
  async getFollowArticle (req, res, next) {
    try {
      let result = await articleModel.find({'author': {
        "$in": req.query.followList
      }}).populate({
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
module.exports = new Follow ();