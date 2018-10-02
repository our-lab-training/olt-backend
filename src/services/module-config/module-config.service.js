// Initializes the `moduleConfig` service on path `/module-config`
const createService = require('feathers-mongoose');
const createModel = require('../../models/module-config.model');
const hooks = require('./module-config.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/module-config', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('module-config');

  service.hooks(hooks);
};
