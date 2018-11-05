// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { app, result, params } = context;
    await app.service('perms').create({perm: [result._id, 'enrolled'], grantee: params.user._id, type: 'users'});
    return context;
  };
};
