const mongoose = require('../../mongodb/db');
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: {
      type: String
    },
    type: {
      type: String // long & short
    },
    content: { // 保存html结构
      type: String,
      require: true // 不可为空
    },
    text: { // 纯文本内容
      type: String
    },
    status: {
      type: Number // -1 0 1
    },
    tag: {
      type: Array
    },
    public_time: {
      type: Date
    },
    update_time: {
      type: Date
    },
    coverBg: {
      type: Array
    },
    viewsTime: {
      type: Number
    },
    isTop: {
      type: Boolean
    },
    author: {
      type: mongoose.Schema.Types.ObjectId, ref: 'user' 
    },
    comment_num: {
      type: Number,
      default: 0
    },
    like_num: {
      type: Number,
      default: 0
    },
    collect_num: {
      type: Number,
      default: 0
    },
    commentFrom: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }
    ],
    likeBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    ],
    collectBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    ],
  },
  {
    versionKey:false
  }
)

const article = mongoose.model('article', articleSchema);

module.exports = article;