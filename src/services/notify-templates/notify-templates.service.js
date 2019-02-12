// Initializes the `notify-template` service on path `/notify-template`
const createService = require('feathers-mongoose');
const createModel = require('../../models/notify-templates.model');
const hooks = require('./notify-templates.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/notify-templates', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('notify-templates');

  service.hooks(hooks);
};
