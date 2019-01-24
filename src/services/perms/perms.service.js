// Initializes the `perms` service on path `/perms`
const createService = require('feathers-mongoose');
const createModel = require('../../models/perms.model');
const hooks = require('./perms.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  // const paginate = app.get('paginate');

  const options = {
    Model,
    paginate: false,
  };

  // Initialize our service with any options it requires
  app.use('/perms', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('perms');

  service.hooks(hooks);
};
