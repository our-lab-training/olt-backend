

const safeRemove = require('../../hooks/safe-remove');

const rebasePerms = require('../../hooks/rebase-perms');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
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
