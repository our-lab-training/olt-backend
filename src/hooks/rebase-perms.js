// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const mongoose = require('mongoose');

const getUserPerms = async (userId, app) => {
  const {isValid} = mongoose.Types.ObjectId;
  const perms = {};
  perms.userperms = await app.service('perms').find({query: {grantee: userId}, paginate: false});
  perms.roles = perms.userperms.reduce((a, up)=>{
    const i = up.perm.indexOf('roles');
    if(i !== -1 && isValid(up.perm[i+1])) a.push(up.perm[i+1]);
    return a;
  }, []);
  perms.roleperms = await app.service('perms').find({query: {grantee: {$in: perms.roles}}, paginate: false});
  perms.all = [...perms.userperms.map(p=>p.perm), ...perms.roleperms.map(p=>p.perm)];
  perms.groups = perms.userperms.reduce((a, up)=>{
    const i = up.perm.indexOf('enrolled');
    if(i !== -1 && isValid(up.perm[i-1])) a.push(up.perm[i-1]);
    return a;
  }, []);
  return perms;
};

// eslint-disable-next-line no-unused-vars
module.exports = function (getUser, options = {}) {
  if(!getUser) getUser = context => context.result.grantee;
  return async context => {
    const userId = getUser(context);
    const {app} = context;
    app.service('users').patch(userId, {perms: await getUserPerms(userId, app)});
    return context;
  };
};
