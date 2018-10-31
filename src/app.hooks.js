// Application hooks that run for every service
const log = require('./hooks/log');

const enabledFilter = require('./hooks/enabled-filter');

const modifiedBy = require('./hooks/modified-by');

const existingContext = require('./hooks/existing-context');

// const fuzzySearch = require('./hooks/fuzzy-search');

const addServiceName = require('./hooks/add-service-name');

module.exports = {
  before: {
    all: [log(), addServiceName()],
    find: [enabledFilter()/*, fuzzySearch()*/],
    get: [],
    create: [modifiedBy()],
    update: [existingContext(), modifiedBy()],
    patch: [existingContext(), modifiedBy()],
    remove: [existingContext()]
  },

  after: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
