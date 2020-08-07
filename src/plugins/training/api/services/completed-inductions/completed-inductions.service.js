// Initializes the `induction` service on path `/induction`
const createService = require('feathers-mongoose');
const createModel = require('../../models/completed-inductions.model');
const hooks = require('./completed-inductions.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/completed-inductions', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('completed-inductions');

  service.hooks(hooks);

  service.find({ query: { proofId: { $exists: false }, done: true } }).then(async ({ data }) => {
    const initProof = async (i) => {
      if (i >= data.length) return;
      await service.patch(data[i]._id, {});
      await initProof(i+1);
    };
    await initProof(0);
  });

};
