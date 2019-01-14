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
    name: { 
      type: String,
      unique: true, // 不可重复
      require: true // 不可为空
    },
    password: { 
      type: String
    },
    gender : { 
      type: String 
    },
    age : { 
      type: Number 
    },
    hobbies : { 
      type: String 
    },
    email : { 
      type: String,
      unique: true, // 不可重复
      require: true // 不可为空
    }
  },
  //{versionKey: false}是干嘛用？如果不加这个设置，我们通过mongoose第一次创建某个集合时，
  // 它会给这个集合设定一个versionKey属性值，我们不需要，所以不让它显示
  {
    versionKey:false
  }
)

const user = mongoose.model('user', userSchema);

module.exports = user;