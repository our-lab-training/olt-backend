const checkPerm = require('../../lib/checkPerm');

module.exports = (app) => {
  app.perms.addPermListener('roles.*', async (context, perm) => {
    const { params, /* data, existing */ } = context;
    // const { grantee } = existing || data;
    const roleId = perm[1];
    const role = await app.service('roles').get(roleId);
    if (!role) return false;
    const { groupId } = role;
    return checkPerm(`${groupId}.users.write`, params.user);
  });
};
