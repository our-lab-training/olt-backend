// Initializes the `Trainings` service on path `/trainings`
const createService = require('feathers-mongoose');
const createModel = require('../../models/binders.model');
const hooks = require('./binders.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/binders', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('binders');

  service.hooks(hooks);
};
