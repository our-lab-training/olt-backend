// Initializes the `induction` service on path `/induction`
const createService = require('feathers-mongoose');
const createModel = require('../../models/inductions.model');
const hooks = require('./inductions.hooks');
const perms = require('./inductions.perms');

module.exports = function (app) {
  perms(app);
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/inductions', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('inductions');

  service.hooks(hooks);
};
