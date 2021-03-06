const { authenticate } = require('@feathersjs/authentication').hooks;
const groupCreateEvent = require('../../lib/groupCreateEvent');
const restrictMethod = require('../../hooks/restrict-method');
const filterByGroup = require('../../hooks/filter-by-group');
const safeRemove = require('../../hooks/safe-remove');
const populateGlobals = require('../../hooks/populate-globals');
const manageSlugs = require('../../hooks/manage-slugs');
const enrollCreator = require('../../hooks/enroll-creator');

const uploadLogo = require('../../hooks/upload-logo');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [filterByGroup({override: 'superadmin.groups.read'})],
    get: [restrictMethod('{id}.enrolled')],
    create: [restrictMethod('superadmin.groups.create'), manageSlugs(), uploadLogo()],
    update: [restrictMethod('{id}.group.write'), manageSlugs(), uploadLogo()],
    patch: [restrictMethod('{id}.group.write'), manageSlugs(), uploadLogo()],
    remove: [restrictMethod('superadmin.groups.delete'), safeRemove()]
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
