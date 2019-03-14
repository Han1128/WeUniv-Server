const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const commentModel = require('../../models/Interaction/comment');
const messageModel = require('../../models/message/message');
const mongoose = require('mongoose')

class InterActionUpdate {
  // 文章添加或取消点赞
  async addLikeToList(req, res, next) {
    try {
      let isAdd = req.body.type === 'add'? true : false;
      if(isAdd) {
        // 添加点赞
        await articleModel.update({ _id: req.body.articleId }, { $push: {'likeBy': req.body.userId }, $inc: { 'like_num': 1 } });
        await userModel.update({ _id: req.body.userId }, { $push: {'like_article': req.body.articleId }});
      }
      else {
        // 取消点赞
        await articleModel.update({ _id: req.body.articleId }, { $pull: {'likeBy': req.body.userId }, $inc: { 'like_num': -1 }});
        await userModel.update({ _id: req.body.userId }, { $pull: {'like_article': req.body.articleId }});
      }
      if (req.body.userId === req.body.authorId || !isAdd) {
        // 是否是自己点亮自己
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      else {
        // 查找文章归属者 给作者添加一条通知
        let tranUserId = mongoose.Types.ObjectId(req.body.userId);
        let tranArticleId = mongoose.Types.ObjectId(req.body.articleId);
        const newMessage = new messageModel({
          hasRead: false,
          messageType: 'like',
          time: new Date,
          from_user: tranUserId,
          from_article: tranArticleId
        })
        await newMessage.save();
        await userModel.update({ _id: req.body.authorId }, { $push: { message: newMessage._id }});
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
      let isAdd = req.body.type === 'add'? true : false;
      if(isAdd) {
        // 添加收藏
        await articleModel.update({ _id: req.body.articleId }, { $push: {'collectBy': req.body.userId }, $inc: { 'collect_num': 1 }});
        await userModel.update({ _id: req.body.userId }, { $push: {'collect': req.body.articleId }});
      }
      else {
        // 取消收藏
        await articleModel.update({ _id: req.body.articleId }, { $pull: {'collectBy': req.body.userId }, $inc: { 'collect_num': -1 }});
        await userModel.update({ _id: req.body.userId }, { $pull: {'collect': req.body.articleId }});
      }
      if (req.body.userId === req.body.authorId || !isAdd) {
        // 是否是自己收藏自己
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      else {
        // 查找文章归属者 给作者添加一条通知
        let tranUserId = mongoose.Types.ObjectId(req.body.userId);
        let tranArticleId = mongoose.Types.ObjectId(req.body.articleId);
        const newMessage = new messageModel({
          hasRead: false,
          messageType: 'collect',
          time: new Date,
          from_user: tranUserId,
          from_article: tranArticleId
        })
        await newMessage.save();
        await userModel.update({ '_id': req.body.authorId }, { $push: { 'message': newMessage._id }});
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
  // 评论点赞
  async addCommentLike(req, res, next) {
    try {
      let isAdd = req.body.type === 'add' ? true : false;
      if(isAdd) {
        // 添加点赞
        await commentModel.update({ _id: req.body.commentId }, { $push: {'likeBy': req.body.userId }});
        await userModel.update({ _id: req.body.userId }, { $push: {'like_comment': req.body.commentId }});
      }
      else {
        // 取消点赞
        await commentModel.update({ _id: req.body.commentId }, { $pull: {'likeBy': req.body.userId }});
        await userModel.update({ _id: req.body.userId }, { $pull: {'like_comment': req.body.commentId }});
      }
      if (req.body.comment_author === req.body.userId || !isAdd) {
        // 是否是自己点亮自己
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      else {
        const newMessage = new messageModel({
          hasRead: false,
          messageType: 'like',
          time: new Date,
          from_user: mongoose.Types.ObjectId(req.body.userId),
          from_comment: mongoose.Types.ObjectId(req.body.commentId)
        })
        await newMessage.save();
        await userModel.update({ '_id': req.body.comment_author }, { $push: { 'message': newMessage._id }});
        res.send({
          success: true,
          message: '操作成功'
        })
      }
    } catch (error) {
      console.log('error', error);
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
      let tranAuthorId = mongoose.Types.ObjectId(req.body.authorId);
      let newComment = new commentModel({
        content: req.body.content,
        isEffect: true,
        isReply: req.body.isReply,
        commentTime: new Date(),
        from_author: tranUserId, // 评论人
        from_article: tranArticleId // 评论文章
      })
      await newComment.save();
      await userModel.update({'_id': req.body.userId}, { $push:{'comment': newComment._id }});
      await articleModel.update({'_id': req.body.articleId}, { $push:{'commentFrom': newComment._id }, $inc: { 'comment_num': 1 }});
      if (req.body.userId === req.body.authorId) {
        // 自己评价自己
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      else {
        const newMessage = new messageModel({
          hasRead: false,
          messageType: 'comment',
          time: new Date,
          from_user: tranUserId, // 评论人
          from_comment: newComment._id, // 评论内容
          from_article: tranArticleId // 被评论文章
        })
        await newMessage.save();
        // 往被评论文章作者信箱插入一条信息
        await userModel.update({ '_id': tranAuthorId }, { $push: { 'message': newMessage._id }});
        res.send({
          success: true,
          message: '操作成功'
        })
      }
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '评论提交失败,请重试'
      })
    }
  }
  // 回复评论
  async postReplyComment(req, res, next) {
    try {
      let tranUserId = mongoose.Types.ObjectId(req.body.userId);
      let tranCommentId = mongoose.Types.ObjectId(req.body.commentId);
      let newComment = new commentModel({
        content: req.body.content,
        isEffect: true,
        isReply: true,
        commentTime: new Date(),
        from_author: tranUserId,
        from_comment: tranCommentId
      })
      await newComment.save();
      await userModel.update({'_id': req.body.userId}, { $push:{'comment': newComment._id }});
      await articleModel.update({'_id': req.body.articleId}, { $push:{'commentFrom': newComment._id }, $inc: { 'comment_num': 1 }});
      if (req.body.comment_author === req.body.userId) {
        res.send({
          success: true,
          message: '操作成功'
        })
      }
      else {
        const newMessage = new messageModel({
          hasRead: false,
          messageType: 'comment',
          time: new Date,
          from_user: tranUserId, // 谁做的
          from_comment: tranCommentId // 评论哪条评论
        })
        await newMessage.save();
        await userModel.update({ '_id': req.body.comment_author }, { $push: { 'message': newMessage._id }});
        res.send({
          success: true,
          message: '操作成功'
        })
      }
    } catch (error) {
      console.log('error', error)
      res.send({
        success: false,
        message: '评论提交失败,请重试'
      })
    }
  }
}

module.exports = new InterActionUpdate();