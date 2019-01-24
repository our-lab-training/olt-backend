// Initializes the `roles` service on path `/roles`
const createService = require('feathers-mongoose');
const createModel = require('../../models/roles.model');
const hooks = require('./roles.hooks');
const groupCreate = require('./roles.groupCreate');
const perms = require('./roles.perms');
const channels = require('./roles.channels');

module.exports = function (app) {
  groupCreate(app);
  perms(app);
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/roles', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('roles');

  service.hooks(hooks);
  channels(app);
};
