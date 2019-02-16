const user = require('./user');
const article = require('./article');

module.exports = app => {
  app.use('/api', user);
  app.use('/api', article);
}