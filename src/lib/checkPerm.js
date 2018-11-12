const comparePerm = require('./comparePerm');
module.exports = async (perm='*', user, exact = false) => {
  return user.perms.all.some(p => comparePerm(perm, p, exact));
};
