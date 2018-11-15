const checkPerm = require('../../lib/checkPerm');

module.exports = (app) => {
  app.perms.addPermListener('*.enrolled', async (context, perm) => {
    const { params, data } = context;
    const groupId = perm[0];
    const hasPerm = await (async () => {
      if(checkPerm(`${groupId}.users.write`, params.user)) return true;
      if(data.grantee !== params.user._id +'') return false;
      const group = await app.service('groups').get(groupId);
      return group.type === 'public';
    })();
    if (!hasPerm) return false;
    const roles = await app.service('roles').find({query: {groupId, addOnJoin: true}, paginate: false});
    await Promise.all(roles.map(async (role) => {
      await app.service('perms').create({
        perm: ['roles', role._id],
        grantee: data.grantee,
        type: 'users',
      });
    }));
    return hasPerm;
  });
};
