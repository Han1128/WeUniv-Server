const userModel = require('../../models/user/user');
const messageModel = require('../../models/message/message');

class Message {
  async getCollectMsg (req, res, next) {
    try {
      let result = await userModel.findOne({
        '_id': req.query.userId
      }, {
        description: 1, username: 1, avatar: 1, message: 1
      }).populate({
        path: 'message',
        model: 'message',
        match: { messageType: 'collect' },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_user',
          model: 'user',
          select: { // select内容中1表示要选取的部分 0代表不选取
            username: 1,
            avatar: 1
          }
        }
      }).populate({
        path: 'message',
        model: 'message',
        match: { messageType: 'collect' },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_article',
          model: 'article',
          select: { // select内容中1表示要选取的部分 0代表不选取
            title: 1,
            type: 1,
            author: 1,
            content: 1 
          }
        }
      });
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result
        }
      })
    } catch (error) {
      console.log('reeor', error);
      res.send({
        success: false,
        message: '查询点赞内容失败'
      })
    }
  }

  async getLikeMsg (req, res, next) {
    try {
      let result = await userModel.findOne({
        '_id': req.query.userId
      }, {
        description: 1, username: 1, avatar: 1, message: 1
      }).populate({
        path: 'message',
        model: 'message',
        match: { messageType: 'like' },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_user',
          model: 'user',
          select: { // select内容中1表示要选取的部分 0代表不选取
            username: 1,
            avatar: 1
          }
        }
      }).populate({
        path: 'message',
        model: 'message',
        match: { messageType: 'like' },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_article',
          model: 'article',
          select: { // select内容中1表示要选取的部分 0代表不选取
            title: 1,
            type: 1,
            author: 1,
            content: 1 
          }
        }
      }).populate({
        path: 'message',
        model: 'message',
        match: { messageType: 'like' },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_comment',
          model: 'comment',
          select: { // select内容中1表示要选取的部分 0代表不选取
            content: 1,
            isReply: 1,
            commentTime: 1,
            from_article: 1,
            from_author: 1
          }
        }
      })
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result
        }
      })
    } catch (error) {
      console.log('reeor', error);
      res.send({
        success: false,
        message: '查询收藏内容失败'
      })
    }
  }
  async getCommentMsg(req, res, next) {
    try {
      let result = await userModel.findOne({
        '_id': req.query.userId
      }, {
        description: 1, username: 1, avatar: 1, message: 1
      }).populate({
        path: 'message',
        model: 'message',
        match: { messageType: 'comment' },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_user',
          model: 'user',
          select: { // select内容中1表示要选取的部分 0代表不选取
            username: 1,
            avatar: 1
          }
        }
      }).populate({
        path: 'message',
        model: 'message',
        match: { messageType: 'comment' },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_article',
          model: 'article',
          select: { // select内容中1表示要选取的部分 0代表不选取
            title: 1,
            type: 1,
            author: 1,
            content: 1 
          }
        }
      }).populate({
        path: 'message',
        model: 'message',
        match: { messageType: 'comment' },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_comment',
          model: 'comment',
          select: { // select内容中1表示要选取的部分 0代表不选取
            content: 1,
            isReply: 1,
            commentTime: 1,
            from_article: 1,
            from_author: 1
          }
        }
      })
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result
        }
      })
    } catch (error) {
      console.log('error', error);
      res.send({
        success: false,
        message: '获取评论内容失败'
      });
    }
  }
  async getUnReadMsg(req, res, next) {
    try {
      let result = await userModel.findOne({
        '_id': req.query.userId
      }, {
        description: 1, username: 1, avatar: 1, message: 1
      }).populate({
        path: 'message',
        model: 'message',
        match: { hasRead: false },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_user',
          model: 'user',
          select: { // select内容中1表示要选取的部分 0代表不选取
            username: 1,
            avatar: 1
          }
        }
      }).populate({
        path: 'message',
        model: 'message',
        match: { hasRead: false },
        options: { sort: { 'time': -1 } },
        populate: {
          path: 'from_article',
          model: 'article',
          select: { // select内容中1表示要选取的部分 0代表不选取
            title: 1,
            type: 1,
            author: 1,
            content: 1 
          }
        }
      }).populate({
        path: 'message',
        model: 'message',
        match: { hasRead: false },
        options: { sort: { 'time': -1 }},
        populate: {
          path: 'from_comment',
          model: 'comment',
          select: { // select内容中1表示要选取的部分 0代表不选取
            content: 1,
            isReply: 1,
            commentTime: 1,
            from_article: 1,
            from_author: 1
          }
        }
      });
      res.send({
        success: true,
        message: '查询成功',
        data: {
          result
        }
      })
    } catch (error) {
      console.log('error', error);
      res.send({
        success: false,
        message: '获取评论内容失败'
      });
    }
  }
  async getMessageCount (req, res, next) {
    try {
      let result = await userModel.findOne({
        '_id': req.query.userId
      });
      // debugger
      let likeCount = await messageModel.find({
        _id: {
          $in: result.message
        },
        messageType: 'like',
      }).count();
      let collectCount = await messageModel.find({
        _id: {
          $in: result.message
        },
        messageType: 'collect'
      }).count();
      let commentCount = await messageModel.find({
        _id: {
          $in: result.message
        },
        messageType: 'comment'
      }).count();
      res.send({
        success: true,
        message: '查询成功',
        data: {
          likeCount,
          collectCount,
          commentCount
        }
      })
    } catch (error) {
      console.log('reeor', error);
      res.send({
        success: false,
        message: '查询数量失败'
      })
    }
  }
  // 更新消息已读状态
  async updateUnreadMsg(req, res, next) {
    try {
      let result = await userModel.findOne({_id: req.body.userId})
      await messageModel.update(
        {
          '_id': {
            $in: result.message
          }
        }, 
        {
          $set: {
            hasRead: true
          }
        },
        { 
          multi: true
        }
      )
      
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

module.exports = new Message();
