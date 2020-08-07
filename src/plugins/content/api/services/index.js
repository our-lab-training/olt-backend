const content = require('./content/content.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(content);
};
