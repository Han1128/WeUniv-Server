const mongoose = require('../../mongodb/db');
const Schema = mongoose.Schema;
/**
 * @param  {Number}   id       id
 * @param  {Function} callback 回调函数
 */
const schooldataSchema = new Schema(
  {
    schoolId: {  // 学号/工号
      type: String,
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

const schooldata = mongoose.model('schooldata', schooldataSchema);

module.exports = schooldata;