const users = require('./users/users.service.js');
const groups = require('./groups/groups.service.js');
const quizzes = require('./quizzes/quizzes.service.js');
const questions = require('./questions/questions.service.js');
const attempts = require('./attempts/attempts.service.js');
const trainings = require('./trainings/trainings.service.js');
const perms = require('./perms/perms.service.js');
const moduleConfigs = require('./module-configs/module-configs.service.js');
const inductions = require('./inductions/inductions.service.js');
const roles = require('./roles/roles.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(groups);
  app.configure(quizzes);
  app.configure(questions);
  app.configure(attempts);
  app.configure(trainings);
  app.configure(perms);
  app.configure(moduleConfigs);
  app.configure(inductions);
  app.configure(roles);
};
