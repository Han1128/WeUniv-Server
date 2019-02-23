const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const schoolSchema = new Schema({
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
})

const school = mongoose.model('school', schoolSchema);

module.exports = school;
