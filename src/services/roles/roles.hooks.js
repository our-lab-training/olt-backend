
const { authenticate } = require('@feathersjs/authentication').hooks;
const { alterItems } = require('feathers-hooks-common');
const safeRemove = require('../../hooks/safe-remove');
const filterByGroup = require('../../hooks/filter-by-group');
const restrictMethod = require('../../hooks/restrict-method');

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
      safeRemove(),
    ],
  },

  after: {
    all: [
      alterItems(async (item, context) => {
        item.perms = await context.app.service('perms')
          .find({ query: { grantee: item._id }, paginate: false});
      }),
    ],
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
