
const { authenticate } = require('@feathersjs/authentication').hooks;
const safeRemove = require('../../../../../hooks/safe-remove');
const filterByGroup = require('../../../../../hooks/filter-by-group');
const restrictMethod = require('../../../../../hooks/restrict-method');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup({ perms: '{groupId}.binders.read', override: 'superadmin.groups.read' }),
    ],
    get: [
      filterByGroup({ perms: '{groupId}.binders.read', override: 'superadmin.groups.read' }),
    ],
    create: [
      restrictMethod(['{data.groupId}.group.suggest', '{data.groupId}.group.write']),
    ],
    update: [
      restrictMethod(['{existing.groupId}.group.suggest', '{existing.groupId}.group.write']),
    ],
    patch: [
      restrictMethod(['{existing.groupId}.group.suggest', '{existing.groupId}.group.write']),
    ],
    remove: [
      restrictMethod(['{existing.groupId}.group.write']),
      safeRemove(),
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
