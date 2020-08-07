const { authenticate } = require('@feathersjs/authentication').hooks;
const { alterItems, iff, isProvider, discard } = require('feathers-hooks-common');
const presignedUrl = require('../../hooks/presigned-url');
const checkCopy = require('../../hooks/check-copy');
const disable = require('../../hooks/disable-suffix');
const safeRemove = require('../../../../../hooks/safe-remove');
const filterByGroup = require('../../../../../hooks/filter-by-group');
const restrictMethod = require('../../../../../hooks/restrict-method');

const setenv = rec => {rec.bucket = process.env.AWS_BUCKET_PRIVATE; rec.region = process.env.AWS_REGION;};

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup({ override: 'superadmin.groups.read' }),
    ],
    get: [
      filterByGroup({ override: 'superadmin.groups.read' }),
    ],
    create: [
      restrictMethod('{data.groupId}.enrolled'),
      iff(isProvider('external'), discard('md5')),
      alterItems(setenv),
    ],
    update: [
      restrictMethod('{existing.groupId}.enrolled'),
      iff(isProvider('external'), discard('groupId')),
      alterItems(setenv),
    ],
    patch: [
      restrictMethod('{existing.groupId}.enrolled'),
      iff(isProvider('external'), discard('groupId')),
      alterItems(setenv),
    ],
    remove: [
      restrictMethod('{existing.groupId}.enrolled'),
      disable(),
      safeRemove(),
    ]
  },

  after: {
    all: [
      alterItems(rec => {const parts = rec.name.split('/'); rec.filename = parts.pop(); rec.path = parts.join('/');}),
      alterItems(rec => rec.key = `${rec.groupId}/${rec._id}.${rec.ext ? rec.ext : rec.filename.split('.').pop()}`),
      iff(isProvider('external'), discard('region', 'bucket')),
    ],
    find: [],
    get: [presignedUrl()],
    create: [presignedUrl(), checkCopy()],
    update: [presignedUrl()],
    patch: [presignedUrl()],
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
