const followModel = require('../../models/follow/follow');
const userModel = require('../../models/user/user');

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
}
module.exports = new Follow ();