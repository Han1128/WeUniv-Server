// 消息推送内容 关注信息 点赞信息 收藏信息 未读信息
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  hasRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String
  },
  time: {
    type: Date
  },
  from_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }, // 如果是评论 对应的是哪一条
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // 来自于哪个用户的
  from_article: { type: mongoose.Schema.Types.ObjectId, ref: 'article' } // 来自哪篇文章
})

const message = mongoose.model('message', messageSchema);

module.exports = message;
