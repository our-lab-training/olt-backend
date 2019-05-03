const { authenticate } = require('@feathersjs/authentication').hooks;
const safeRemove = require('../../hooks/safe-remove');
const populateGlobals = require('../../hooks/populate-globals');
const { alterItems } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [safeRemove()]
  },

  after: {
    all: [
      alterItems(item => item.name = `${item.profile.title || ''} ${item.profile.displayname || `${item.profile.firstname} ${item.profile.lastname}`}`.trim()),
    ],
    find: [],
    get: [],
    create: [populateGlobals()],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
