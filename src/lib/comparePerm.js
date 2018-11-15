const node2reg = node => new RegExp(node.replace(/\//g, '\\/').replace(/\*/g, '.*'));

module.exports = async (perm, p, exact = false) => {
  if(typeof perm === 'string') perm = perm.split('.');
  if(exact && p.length !== perm.length) return false;
  for(let i = 0; i < Math.min(p.length, perm.length); i++){
    if (!exact && p[i] === '*') return true;
    if (p[i] === '*' || p[i].indexOf('*') === -1 || !node2reg(p[i]).test(perm[i])) {
      if ((exact || perm[i] !== '*') && perm[i] !== p[i]) return false;
    }
  }
  return true;
};
