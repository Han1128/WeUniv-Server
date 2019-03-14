const mongoose = require('../../mongodb/db');
const Schema = mongoose.Schema;

const adminSetSchema = new Schema(
  {
    updateTime: {
      type: Date
    },
    setBy: {
      type: mongoose.Schema.Types.ObjectId, ref: 'user' 
    },
    recommendList: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'article' }
    ],
    recommendUser: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    ],
    swiperList: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'article' }
    ]
  },
  {
    versionKey:false
  }
)

const adminSet = mongoose.model('adminSet', adminSetSchema);

module.exports = adminSet;