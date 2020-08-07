const checkPerm = require('../../../../../lib/checkPerm');

module.exports = (app) => {
  app.perms.addPermListener('inductions.*.inductor', async (context, perm) => {
    const { params } = context;
    const parts = typeof perm === 'string' ? perm.split('.') : perm;
    const induct = await app.service('inductions').get(parts[1]);
    if (checkPerm(`${induct.groupId}.inductions.write`, params.user)) return true;
    if (checkPerm(`${induct.groupId}.users.write`, params.user)) return true;
    return false;
  });
};