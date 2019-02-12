const users = require('./users/users.service.js');
const groups = require('./groups/groups.service.js');
const perms = require('./perms/perms.service.js');
const roles = require('./roles/roles.service.js');
const issues = require('./issues/issues.service.js');
const events = require('./events/events.service.js');
const notifyTemplates = require('./notify-templates/notify-templates.service.js');
const notifications = require('./notifications/notifications.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(groups);
  app.configure(perms);
  app.configure(roles);
  app.configure(issues);
  app.configure(events);
  app.configure(notifyTemplates);
  app.configure(notifications);
};
