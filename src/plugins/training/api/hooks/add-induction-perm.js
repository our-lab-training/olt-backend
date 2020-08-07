// const { getItems, replaceItems } = require('feathers-hooks-common');

const checkPerm = require('../../../../lib/checkPerm');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const { result, app, params } = context;
    const userIds = result.userIds || [];
    const perm = ['inductions', result.inductId, 'complete'];
    if (!result.done) return context;

    const users = await app.service('users').find({ query: { _id: { $in: userIds } }, paginate: false });

    await Promise.all(users.map(async (user) => {
      if (!checkPerm(perm, user, true)) {
        await app.service('perms').create({
          grantee: user._id,
          type: 'users',
          perm,
          data: { compInductId: result._id },
        }, { user: params.user });
      }
    }));

  };
};
