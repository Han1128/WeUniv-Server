const mongoose = require('../../mongodb/db');

const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      require: true // 不可为空
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
    // article_bg: {
    //   type: String
    // },
    author: {
      type: mongoose.Schema.Types.ObjectId, ref: 'user' 
    },
    // article_comment: {
    //   type: mongoose.Schema.Types.ObjectId, ref: 'commont' 
    // },
    // article_like: {
    //   type: mongoose.Schema.Types.ObjectId, ref: 'like' 
    // },
    // article_colllect: {
    //   type: mongoose.Schema.Types.ObjectId, ref: 'colllect' 
    // },
  },
  {
    versionKey:false
  }
)

const article = mongoose.model('article', articleSchema);

module.exports = article;