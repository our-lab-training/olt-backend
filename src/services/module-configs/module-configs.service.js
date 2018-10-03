// Initializes the `moduleConfig` service on path `/module-config`
const createService = require('feathers-mongoose');
const createModel = require('../../models/module-configs.model');
const hooks = require('./module-configs.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/module-configs', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('module-configs');

  service.hooks(hooks);
};
