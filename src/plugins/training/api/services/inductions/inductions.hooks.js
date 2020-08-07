
const { authenticate } = require('@feathersjs/authentication').hooks;
const safeRemove = require('../../../../../hooks/safe-remove');
const restrictMethod = require('../../../../../hooks/restrict-method');
const filterByGroup = require('../../../../../hooks/filter-by-group');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup({ perms: '{groupId}.inductions.read', override: 'superadmin.groups.read' }),
    ],
    get: [
      filterByGroup({ perms: '{groupId}.inductions.read', override: 'superadmin.groups.read' }),
    ],
    create: [
      restrictMethod(['{data.groupId}.inductions.write', '{data.groupId}.inductions.suggest']),
    ],
    update: [
      restrictMethod(['{existing.groupId}.inductions.write', '{existing.groupId}.inductions.suggest']),
    ],
    patch: [
      restrictMethod(['{existing.groupId}.inductions.write', '{existing.groupId}.inductions.suggest']),
    ],
    remove: [
      restrictMethod(['{existing.groupId}.inductions.write']),
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
