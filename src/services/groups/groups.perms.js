const checkPerm = require('../../lib/checkPerm');

module.exports = (app) => {
  app.perms.addPermListener('*.enrolled', async (context, perm) => {
    const { params, data, existing } = context;
    let { grantee, type } = existing || data;
    const groupId = perm[0];
    const hasPerm = await (async () => {
      if(checkPerm(`${groupId}.users.write`, params.user)) return true;
      if(grantee !== params.user._id +'') return false;
      const group = await app.service('groups').get(groupId);
      return ['public', 'global'].indexOf(group.type) !== -1;
    })();
    if (!hasPerm) return false;
    if (type === 'roles') return hasPerm;
    if (/^\d{8}$/.test(grantee)) {
      let user = (await app.service('users').find({ query: { username: grantee }, paginate: false}))[0];
      if (!user) user = await app.service('users').create({
        username: grantee,
        email: `${grantee}@pending.uwa.edu.au`,
        profile: {
          displayname: 'Details Pending First Login',
          firstname: 'Details Pending',
          lastname: 'First Login',
        },
      });
      data.grantee = user._id;
      grantee = user._id;
    }
    const roles = await app.service('roles').find({query: {groupId, addOnJoin: true}, paginate: false});
    await Promise.all(roles.map(async (role) => {
      await app.service('perms').create({
        perm: ['roles', role._id],
        grantee,
        type: 'users',
      });
    }));
    return hasPerm;
  });
};
