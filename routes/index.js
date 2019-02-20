const user = require('./user');
const article = require('./article');
const follow = require('./follow');

module.exports = app => {
  app.use('/api', user);
  app.use('/api', article);
  app.use('/api', follow);
}