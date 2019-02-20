const mongoose = require('../../mongodb/db');

const Schema = mongoose.Schema;
/**
 * @param  {Number}   id       id
 * @param  {Function} callback 回调函数
 */
const schoolDataSchema = new Schema(
  {
    ID : {  // 学号/工号
      type: String,
      unique: true, // 不可重复
      default: ''
    },
    schoolName: { 
      type: String,
      default: ''
    },
    Institute: { // 学院
      type: String,
      default: ''
    },
    grade: { // 年级
      type: String,
      default: ''
    },
    class: {
      type: String,
      default: ''
    },
    profession: { 
      type: String,
      default: ''
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  },
  {
    versionKey:false
  }
)

const schoolData = mongoose.model('schoolData', schoolDataSchema);

module.exports = schoolData;