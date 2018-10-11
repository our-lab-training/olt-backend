
const restrictMethod = require('../../hooks/restrict-method');

const filterByGroup = require('../../hooks/filter-by-group');

const safeRemove = require('../../hooks/safe-remove');

module.exports = {
  before: {
    all: [],
    find: [filterByGroup({override: 'superadmin.groups.read'})],
    get: [restrictMethod('{id}.enrolled')],
    create: [restrictMethod('superadmin.groups.create')],
    update: [restrictMethod('{id}.group.update')],
    patch: [restrictMethod('{id}.group.update')],
    remove: [restrictMethod('{id}.group.delete'), safeRemove()]
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
