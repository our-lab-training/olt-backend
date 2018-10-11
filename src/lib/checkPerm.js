module.exports = async (perm='*', user) => {
  if(typeof perm === 'string') perm = perm.split();
  return user.perms.all.some(p => {
    for(let i = 0; i < Math.min(p.length, perm.length); i++){
      if(p[i] === '*') return true;
      if(perm[i] === '*' || perm[i] === p[i]) continue;
      return false;
    }
    return true;
  });
};
