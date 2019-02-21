const user = require('./user');
const article = require('./article');
const follow = require('./follow');
const interaction = require('./interaction');

module.exports = app => {
  app.use('/api', user);
  app.use('/api', article);
  app.use('/api', follow);
  app.use('/api', interaction);
}