const safeRemove = require('../../hooks/safe-remove');
const filterByGroup = require('../../hooks/filter-by-group');
const restrictMethod = require('../../hooks/restrict-method');

module.exports = {
  before: {
    all: [],
    find: [filterByGroup({override: 'superadmin.groups.read'})],
    get: [restrictMethod('{id}.enrolled')],
    create: [restrictMethod('{id}.group.update')],
    update: [restrictMethod('{id}.group.update')],
    patch: [restrictMethod('{id}.group.update')],
    remove: [restrictMethod('{id}.group.update'), safeRemove()]
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
