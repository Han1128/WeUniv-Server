/**
 * models层
 */
const mongoose = require('../../mongodb/db');

const Schema = mongoose.Schema;
/**
 * @param  {Number}   id       id
 * @param  {Function} callback 回调函数
 */
const userSchema = new Schema(
  {
    username: { 
      type: String,
      unique: true, // 不可重复
      require: true // 不可为空
    },
    email : { 
      type: String,
      unique: true, // 不可重复
      require: true // 不可为空
    },
    password: {
      type: String
    },
    gender : { 
      type: String // 1代表男性 0代表女性
    },
    birth : { 
      type: Date 
    },
    phone: {
      type: String
    },
    hobby_tags: {
      type: Array
    },
    status: {
      type: Number,
      default: 0
    },
    userType: {
      type: String
    },
    avatar: {
      type: String
    },
    bg_pic: {
      type: String
    },
    topArticle: { // 置顶文章Id
      type: String
    },
    description: {
      type: String,
      default: '这个人很懒,什么都没留下'
    },
    createTime: {
      type: Date
    },
    token: {
      type: String
    },
    article: [
      // 一对多
      { type: mongoose.Schema.Types.ObjectId, ref: 'article' }
    ],
    follow: {
      // 一对一
      type: mongoose.Schema.Types.ObjectId, ref: 'follow' 
    },
    schoolData: {
      // 一对一
      type: mongoose.Schema.Types.ObjectId, ref: 'schoolData'
    },
    message: [
      // 一对多
      { type: mongoose.Schema.Types.ObjectId, ref: 'message' }
    ],
    comment: [
      // 一对多
      { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }
    ],
    like_article: [
      // 一对多
      { type: mongoose.Schema.Types.ObjectId, ref: 'article' }
    ],
    like_comment: [
      // 一对多
      { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }
    ],
    collect: [
      // 一对多
      { type: mongoose.Schema.Types.ObjectId, ref: 'article' }
    ],
  },
  //{versionKey: false}是干嘛用？如果不加这个设置，我们通过mongoose第一次创建某个集合时，
  // 它会给这个集合设定一个versionKey属性值，我们不需要，所以不让它显示
  {
    versionKey:false
  }
)

const user = mongoose.model('user', userSchema);

module.exports = user;