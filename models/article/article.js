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
    content: {
      type: String,
      require: true // 不可为空
    },
    status: {
      type: Number // -1 0 1
    },
    tag: {
      type: String
    },
    public_time: {
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
    comment: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }
    ],
    likeBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    ],
    colllectBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    ],
  },
  {
    versionKey:false
  }
)

const article = mongoose.model('article', articleSchema);

module.exports = article;