
const { authenticate } = require('@feathersjs/authentication').hooks;
const { alterItems } = require('feathers-hooks-common');
const safeRemove = require('../../hooks/safe-remove');
// const filterByGroup = require('../../hooks/filter-by-group');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [/* filterByGroup({id: 'groupId'}) */],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [safeRemove()]
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
