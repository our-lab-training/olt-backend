
const safeRemove = require('../../hooks/safe-remove');
const populateGlobals = require('../../hooks/populate-globals');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [safeRemove()]
  },

  after: {
    all: [],
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
