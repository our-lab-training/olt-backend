const comparePerm = require('./comparePerm');
module.exports = (perm='*', user, exact = false) => {
  return user.perms.all.some(p => comparePerm(perm, p, exact));
};
