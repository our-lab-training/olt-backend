const groupCreateEvent = require('../../lib/groupCreateEvent');
const restrictMethod = require('../../hooks/restrict-method');
const filterByGroup = require('../../hooks/filter-by-group');
const safeRemove = require('../../hooks/safe-remove');
const populateGlobals = require('../../hooks/populate-globals');
const manageSlugs = require('../../hooks/manage-slugs');
const enrollCreator = require('../../hooks/enroll-creator');

module.exports = {
  before: {
    all: [],
    find: [filterByGroup({override: 'superadmin.groups.read'})],
    get: [restrictMethod('{id}.enrolled')],
    create: [restrictMethod('superadmin.groups.create'), manageSlugs()],
    update: [restrictMethod('{id}.group.update'), manageSlugs()],
    patch: [restrictMethod('{id}.group.update'), manageSlugs()],
    remove: [restrictMethod('{id}.group.delete'), safeRemove()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      groupCreateEvent.hook,
      populateGlobals(), 
      enrollCreator(),
    ],
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
