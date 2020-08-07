const binders = require('./binders/binders.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(binders);
};
