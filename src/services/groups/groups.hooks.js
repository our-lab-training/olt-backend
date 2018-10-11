
const restrictMethod = require('../../hooks/restrict-method');

const filterByGroup = require('../../hooks/filter-by-group');

module.exports = {
  before: {
    all: [],
    find: [filterByGroup()],
    get: [restrictMethod('{id}.enrolled')],
    create: [restrictMethod('superadmin.groups.create')],
    update: [restrictMethod('{id}.group.update')],
    patch: [restrictMethod('{id}.group.update')],
    remove: [restrictMethod('{id}.group.remove')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
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
