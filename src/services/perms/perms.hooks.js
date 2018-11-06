

const safeRemove = require('../../hooks/safe-remove');

const rebasePerms = require('../../hooks/rebase-perms');

const reEnablePerm = require('../../hooks/re-enable-perm');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [reEnablePerm()],
    update: [],
    patch: [],
    remove: [safeRemove()]
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
