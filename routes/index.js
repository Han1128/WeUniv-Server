const user = require('./user');
const article = require('./article');
const follow = require('./follow');
const interaction = require('./interaction');
const message = require('./message');
const search = require('./search');
const admin = require('./admin');
const tag = require('./tag');

module.exports = app => {
  app.use('/api', user);
  app.use('/api', article);
  app.use('/api', follow);
  app.use('/api', interaction);
  app.use('/api', message);
  app.use('/api', search);
  app.use('/api', admin);
  app.use('/api', tag);
}