const followModel = require('../../models/follow/follow');
const userModel = require('../../models/user/user');

class Follow {
  // 添加关注
  async addFllowShip(req, res) {
    try {
      await followModel.update({ 'author': req.body.userid }, { 
        $push: { 'following': req.body.followid },
        $inc: { 'following_num': 1 }
      });
      await followModel.update({ 'author': req.body.followid }, { 
        $push: { 'follower': req.body.userid },
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
      await followModel.update({ 'author': req.body.userid }, { 
        $pull: { 'following': req.body.followid },
        $inc: { 'following_num': -1 }
      });
      await followModel.update({ 'author': req.body.followid }, { 
        $pull: { 'follower': req.body.userid },
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
}
module.exports = new Follow ();