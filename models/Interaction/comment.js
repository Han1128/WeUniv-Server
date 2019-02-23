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
    isEffect: { // 是否有效
      type: Boolean
    },
    isReply: { // 是否是回复
      type: Boolean
    },
    likeBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // 被谁点赞
    from_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }, // 回复哪条评论
    from_author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // 谁评论的
    from_article: { type: mongoose.Schema.Types.ObjectId, ref: 'article' } // 从哪个文章里面评论
  },
  {
    versionKey:false
  }
)

const comment = mongoose.model('comment', commentSchema);

module.exports = comment;