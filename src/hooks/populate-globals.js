// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const {app, serviceName} = context;
    const permsService = app.service('perms');
    
    if(serviceName === 'groups'){
      const users = await app.service('users').find({query: {$select: ['_id']}, paginate: false});
      const groupId = context.result._id;
      users.forEach(user => {
        permsService.create({grantee: user._id, perm: [groupId, 'enrolled'], type: 'users'});
      });
    }
    if(serviceName === 'users'){
      const groups = await app.service('groups').find({query: {type: 'global', $select: ['_id']}, paginate: false});
      const userId = context.result._id;
      groups.forEach(group => {
        permsService.create({grantee: userId, perm: [group._id, 'enrolled'], type: 'users'});
      });
    }
    return context;
  };
};
