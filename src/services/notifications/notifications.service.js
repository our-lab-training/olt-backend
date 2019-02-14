// Initializes the `notifications` service on path `/notifications`
const createService = require('feathers-mongoose');
const createModel = require('../../models/notifications.model');
const hooks = require('./notifications.hooks');
const timeout = require('./notifications.timeout');
const notifme = require('@feathers-nuxt/feathers-notifme');
const { disallow } = require('feathers-hooks-common');

module.exports = function (app) {
  timeout(app);
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/notifications', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('notifications');

  service.hooks(hooks);

  app.use('/notifme', notifme({
    useNotificationCatcher: process.env.NODE_ENV !== 'production',
    channels: app.get('notifyChannels'),
  }));
  app.service('notifme').hooks({ before: { all: [disallow('external')] } });
};
