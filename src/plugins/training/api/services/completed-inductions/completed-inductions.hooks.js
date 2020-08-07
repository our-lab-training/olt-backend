
const { authenticate } = require('@feathersjs/authentication').hooks;
const { iff, disallow, discard, isProvider, alterItems } = require('feathers-hooks-common');
const _ = require('lodash');
const restrictMethod = require('../../../../../hooks/restrict-method');
const safeRemove = require('../../../../../hooks/safe-remove');
const filterByGroup = require('../../../../../hooks/filter-by-group');
const comparePerm = require('../../../../../lib/comparePerm');
const checkPerm = require('../../../../../lib/checkPerm');
const validateUsers = require('../../hooks/validate-users');
const addInductionPerm = require('../../hooks/add-induction-perm');
const inductionProof = require('../../hooks/induction-proof');

const filterByAccess = ctx => {
  if (!ctx.params.query || !ctx.params.query.$and || !ctx.params.user) return ctx;
  const groups = ctx.params.query.$and.pop();
  const inductIds = _.uniq(ctx.params.user.perms.all.reduce((a, perm) => {
    const match = comparePerm('inductions.*.inductor', perm, false);
    return match ? [...a, perm[1]] : a;
  }, [])).filter(id => /[0-9abcdef]{24}/.test(id));
  const or = [
    groups,
    { userIds: ctx.params.user._id },
    { inductId: { $in: inductIds } },
  ];
  ctx.params.query.$and.push({$or: or});
};

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      filterByGroup({ perms: ['{groupId}.inductions.write', '{groupId}.inductions.inductor'], override: 'superadmin.groups.read' }),
      filterByAccess,
    ],
    get: [
      filterByGroup({ perms: ['{groupId}.inductions.write', '{groupId}.inductions.inductor'], override: 'superadmin.groups.read' }),
      filterByAccess,
    ],
    create: [
      restrictMethod(['inductions.{data.inductId}.inductor', '{data.groupId}.inductions.inductor', '{data.groupId}.inductions.write']),
      iff(
        ctx => !checkPerm(`${ctx.data.groupId}.inductions.write`, ctx.params.user) || !ctx.data.proofId,
        [
          iff(
            isProvider('external'),
            [
              discard('userIds', 'proofId', 'proofMd', 'completedAt', 'inductorName', 'inductorId'),
              alterItems((item, ctx) => ({ ...item, inductorId: ctx.params.user._id })),
            ],
          ),
          validateUsers(),
          inductionProof(),
        ],
      ),
    ],
    update: [
      restrictMethod(['inductions.{data.inductId}.inductor', '{data.groupId}.inductions.inductor']),
      iff(cont => cont.existing && cont.existing.done, disallow('external')),
      iff(
        isProvider('external'),
        [
          discard('userIds', 'groupId', 'proofId', 'proofMd', 'completedAt', 'inductorName', 'inductorId'),
        ],
      ),
      validateUsers(),
      inductionProof(),
    ],
    patch: [
      restrictMethod(['inductions.{data.inductId}.inductor', '{data.groupId}.inductions.inductor']),
      iff(cont => cont.existing && cont.existing.done, disallow('external')),
      iff(
        isProvider('external'),
        [
          discard('userIds', 'groupId', 'proofId', 'proofMd', 'completedAt', 'inductorName', 'inductorId'),
        ],
      ),
      validateUsers(),
      inductionProof(),
    ],
    remove: [
      restrictMethod('superadmin.inductions.remove'),
      safeRemove(),
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      addInductionPerm(),
    ],
    update: [
      addInductionPerm(),
    ],
    patch: [
      addInductionPerm(),
    ],
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
