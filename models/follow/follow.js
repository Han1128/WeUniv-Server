const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const followSchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  following_num: {
    type: Number,
    default: 0
  },
  follower_num: {
    type: Number,
    default: 0
  },
	following: [{type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
	follower: [{type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
})

const follow = mongoose.model('follow', followSchema);

module.exports = follow;
