
const { authenticate } = require('@feathersjs/authentication').hooks;
const permEvent = require('../../lib/permEvent');
const safeRemove = require('../../hooks/safe-remove');
const filterByGroup = require('../../hooks/filter-by-group');
const rebasePerms = require('../../hooks/rebase-perms');
const reEnablePerm = require('../../hooks/re-enable-perm');
const disableMethod = require('../../hooks/disable-method');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup({
        id: 'perm[0]', 
        override: 'superadmin.perms.list',
        restrict: '{groupId}.perms.list',
      }),
    ],
    get: [disableMethod()],
    create: [permEvent.hook, reEnablePerm()],
    update: [disableMethod()],
    patch: [disableMethod()],
    remove: [permEvent.hook, safeRemove()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [rebasePerms()],
    update: [rebasePerms()],
    patch: [rebasePerms()],
    remove: [rebasePerms()]
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
