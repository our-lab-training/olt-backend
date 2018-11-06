module.exports = async (perm='*', user, exact = false) => {
  if(typeof perm === 'string') perm = perm.split('.');
  return user.perms.all.some(p => {
    if(exact && p.length !== perm.length) return false;
    for(let i = 0; i < Math.min(p.length, perm.length); i++){
      if (!exact && p[i] === '*') return true;
      if ((exact || perm[i] !== '*') && perm[i] !== p[i]) return false;
    }
    return true;
  });
};
