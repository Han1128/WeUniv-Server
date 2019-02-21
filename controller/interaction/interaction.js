const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const commentModel = require('../../models/Interaction/comment');
const messageModel = require('../../models/message/message');
const mongoose = require('mongoose')

class InterAction {
  // 添加或取消点赞
  async addLikeToList(req, res, next) {
    try {
      if(req.body.type === 'add') {
        // 添加点赞
        await articleModel.update({ _id: req.body.articleId }, { $push: {'likeBy': req.body.userId }});
        await userModel.update({ _id: req.body.userId }, { $push: {'like': req.body.articleId }});
      }
      else {
        // 取消点赞
        await articleModel.update({ _id: req.body.articleId }, { $pull: {'likeBy': req.body.userId }});
        await userModel.update({ _id: req.body.userId }, { $pull: {'like': req.body.articleId }});
      }
      if (req.body.ownOperator) {
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      else {
        let result = await articleModel.findOne({'_id': req.body.articleId});
        const newMessage = new messageModel({
          hasRead: false,
          messageType: 'like',
          time: new Date,
          from_user: result.author,
          from_article: result._id
        })
        await newMessage.save();
        await userModel.update({ _id: result.author }, { $push: { message: newMessage._id }});
        res.send({
          success: true,
          message: '操作成功'
        })
      }
    } catch (error) {
      res.send({
        success: false,
        message: '更新操作失败,请重试'
      })
    }
  }
  // 添加或取消收藏
  async addCollectToList(req, res, next) {
    try {
      if(req.body.type === 'add') {
        // 添加点赞
        await articleModel.update({ _id: req.body.articleId }, { $push: {'collectBy': req.body.userId }});
        await userModel.update({ _id: req.body.userId }, { $push: {'collect': req.body.articleId }});
      }
      else {
        // 取消点赞
        await articleModel.update({ _id: req.body.articleId }, { $pull: {'collectBy': req.body.userId }});
        await userModel.update({ _id: req.body.userId }, { $pull: {'collect': req.body.articleId }});
      }
      if (req.body.ownOperator) {
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      else {
        let result = await articleModel.findOne({'_id': req.body.articleId});
        const newMessage = new messageModel({
          hasRead: false,
          messageType: 'collect',
          time: new Date,
          from_user: result.author,
          from_article: result._id
        })
        await newMessage.save();
        await userModel.update({ '_id': result.author }, { $push: { 'message': newMessage._id }});
        res.send({
          success: true,
          message: '操作成功'
        })
      }
    } catch (error) {
      res.send({
        success: false,
        message: '更新操作失败,请重试'
      })
    }
  }
  // 提交评论
  async postComment(req, res, next) {
    try {
      let tranUserId = mongoose.Types.ObjectId(req.body.userId);
      let tranArticleId = mongoose.Types.ObjectId(req.body.articleId);
      let newComment = new commentModel({
        content: req.body.content,
        isEffect: true,
        commentTime: new Date(),
        author: tranUserId,
        article: tranArticleId
      })
      await newComment.save();
      await userModel.update({'_id': req.body.userId}, { $push:{'comment': newComment._id }});
      await articleModel.update({'_id': req.body.articleId}, { $push:{'comment': newComment._id }});
      if (req.body.ownOperator) {
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      {

        const newMessage = new messageModel({
          hasRead: false,
          messageType: 'comment',
          time: new Date,
          from_user: tranUserId,
          from_article: tranArticleId
        })
        await newMessage.save();
        await userModel.update({ '_id': tranUserId }, { $push: { 'message': newMessage._id }});
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      // 判断是不是自己评论自己
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '评论提交失败,请重试'
      })
    }
  }
}

module.exports = new InterAction();