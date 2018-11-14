const checkPerm = require('../../lib/checkPerm');

module.exports = (app) => {
  app.perms.addPermListener('*.enrolled', async (context, perm) => {
    const { params, data } = context;
    const groupId = perm[0];
    if(checkPerm(`${groupId}.users.write`, params.user)) return true;
    if(data.grantee !== params.user._id +'') return false;
    const group = await app.service('groups').get(groupId);
    return group.type === 'public';
  });
};
