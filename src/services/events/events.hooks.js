const { authenticate } = require('@feathersjs/authentication').hooks;
const restrictMethod = require('../../hooks/restrict-method');
const filterByGroup = require('../../hooks/filter-by-group');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup({ perms: '{groupId}.group.read', override: 'superadmin.groups.read' }),
    ],
    get: [
      filterByGroup({ perms: '{groupId}.group.read', override: 'superadmin.groups.read' }),
    ],
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
