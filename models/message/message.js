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
  from_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'comment' },
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  from_article: { type: mongoose.Schema.Types.ObjectId, ref: 'article' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
})

const message = mongoose.model('message', messageSchema);

module.exports = message;
