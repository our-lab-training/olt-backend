// const { getItems, replaceItems } = require('feathers-hooks-common');

const request = require('request-promise-native');
const errors = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const { data, existing, app } = context;
    const userIds = (existing && existing.userIds) || [];
    data.inductId = (existing && existing.inductId) || data.inductId;
    if (existing && existing.done) return context;

    await Promise.all((data.users || []).map( async (user) => {
      if (typeof user !== 'object') return;
      let body = null;
      try {
        body = await request({
          method: 'POST',
          uri: 'https://auth.systemhealthlab.com/api/login',
          body: {
            user: user.username,
            pass: user.password,
            token: process.env.AUTH_TOKEN,
          },
          json: true,
        });
      } catch(err) {
        if (err.statusCode >= 400 && err.statusCode < 500) throw new errors.NotAuthenticated(err.error.message);
        console.error(err); // eslint-disable-line
        throw new errors.GeneralError('Unknown login issue occurred, please contact an administrator.');
      }
      if(!body.success) throw new errors.NotAuthenticated(body.message);
      const users = await app.service('users').find({ query: { username: user.username }, paginate: false });
      if (!users[0] || userIds.indexOf(users[0]._id) !== -1) {
        throw new errors.NotAuthenticated('User has not yet logged into Our Lab Training.');
      }
      userIds.push(users[0]._id);
    }));
    data.userIds = userIds;
  };
};
