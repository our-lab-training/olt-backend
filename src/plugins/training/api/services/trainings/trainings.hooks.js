const { authenticate } = require('@feathersjs/authentication').hooks;
const safeRemove = require('../../../../../hooks/safe-remove');
const checkComplete = require('../../hooks/checkComplete');
const restrictMethod = require('../../../../../hooks/restrict-method');
const filterByGroup = require('../../../../../hooks/filter-by-group');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup({ perms: '{groupId}.trainings.read', override: 'superadmin.groups.read' }),
    ],
    get: [
      filterByGroup({ perms: '{groupId}.trainings.read', override: 'superadmin.groups.read' }),
    ],
    create: [
      restrictMethod(['{data.groupId}.trainings.write', '{data.groupId}.trainings.suggest']),
    ],
    update: [
      restrictMethod(['{existing.groupId}.trainings.write', '{existing.groupId}.trainings.suggest']),
    ],
    patch: [
      restrictMethod(['{existing.groupId}.trainings.write', '{existing.groupId}.trainings.suggest']),
    ],
    remove: [
      restrictMethod(['{existing.groupId}.trainings.write']),
      safeRemove(),
    ]
  },

  after: {
    all: [checkComplete()],
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
