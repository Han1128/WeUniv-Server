const mongoose = require('../../mongodb/db');

const Schema = mongoose.Schema;
/**
 * @param  {Number}   id       id
 * @param  {Function} callback 回调函数
 */
const commentSchema = new Schema(
  {
    content: {
      type: String
    },
    commentTime: {
      type: Date
    },
    isEffect: {
      type: Boolean
    },
    commonent_from: { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }, // 回复哪条评论
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'article' }
  },
  {
    versionKey:false
  }
)

const comment = mongoose.model('comment', commentSchema);

module.exports = comment;