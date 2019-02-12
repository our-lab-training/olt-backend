const { authenticate } = require('@feathersjs/authentication').hooks;
const restrictMethod = require('../../hooks/restrict-method');
const filterByGroup = require('../../hooks/filter-by-group');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup(),
    ],
    get: [],
    create: [
      restrictMethod('{data.groupId}.group.write'),
    ],
    update: [
      restrictMethod('{existing.groupId}.group.write'),
    ],
    patch: [
      restrictMethod('{existing.groupId}.group.write'),
    ],
    remove: [
      restrictMethod('{existing.groupId}.group.write'),
    ]
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
