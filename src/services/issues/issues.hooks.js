const { disallow, alterItems } = require('feathers-hooks-common');
const createIssue = require('github-create-issue');
const { authenticate } = require('@feathersjs/authentication').hooks;

const opts = {
  token: process.env.GITHUB_ISSUE_TOKEN,
};

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [disallow('external')],
    get: [disallow('external')],
    create: [
      alterItems( (item, context) => {
        item.body += `\n\n### Submitter info:\n${context.params.user.username} - ${context.params.user.email}`;
      }),
    ],
    update: [disallow('external')],
    patch: [disallow('external')],
    remove: [disallow('external')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context) => new Promise((resolve, reject) => {
        const { result } = context;
        createIssue('ThinkHub-io/access-issues', result.title, {...result, ...opts}, (error, issue) => {
          if (error) return reject(error);
          result.issue = issue;
          resolve(context);
        });
      }),
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
