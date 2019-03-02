const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  iconCode: {
    type: String
  },
  iconLabel: {
    type: String
  },
  follower_num: {
    type: Number,
    default: 0
  },
	follower: [{type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
})

const tag = mongoose.model('tag', tagSchema);

module.exports = tag;
