const { authenticate } = require('@feathersjs/authentication').hooks;
const safeRemove = require('../../hooks/safe-remove');
const populateGlobals = require('../../hooks/populate-globals');
const { alterItems, iff, disallow } = require('feathers-hooks-common');
const filterByGroup = require('../../hooks/filter-by-group');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup({override: 'superadmin.groups.read'}),
    ],
    get: [
      iff(
        ctx => !ctx.params.user || ctx.id !== `${ctx.params.user._id}`,
        filterByGroup({override: 'superadmin.groups.read'}),
      ),
    ],
    create: [
      disallow('external'),
    ],
    update: [
      iff(
        ctx => !ctx.params.user || ctx.id !== `${ctx.params.user._id}`,
        disallow('external'),
      ),
    ],
    patch: [
      iff(
        ctx => !ctx.params.user || ctx.id !== `${ctx.params.user._id}`,
        disallow('external'),
      ),
    ],
    remove: [
      iff(
        ctx => !ctx.params.user || ctx.id !== `${ctx.params.user._id}`,
        disallow('external'),
      ),
      safeRemove(),
    ]
  },

  after: {
    all: [
      alterItems(item => item.name = `${item.profile.title || ''} ${item.profile.displayname || `${item.profile.firstname} ${item.profile.lastname}`}`.trim()),
    ],
    find: [],
    get: [],
    create: [populateGlobals()],
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
