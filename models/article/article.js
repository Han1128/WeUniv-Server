const mongoose = require('../../mongodb/db');

const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    articleName: {
      type: String
    },
    author: {
      type: mongoose.Schema.Types.ObjectId, ref: 'user' 
    }
  },
  {
    versionKey:false
  }
)

const article = mongoose.model('article', articleSchema);

module.exports = article;