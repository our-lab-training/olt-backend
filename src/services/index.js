const users = require('./users/users.service.js');
const groups = require('./groups/groups.service.js');
const perms = require('./perms/perms.service.js');
const roles = require('./roles/roles.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(groups);
  app.configure(perms);
  app.configure(roles);
};
