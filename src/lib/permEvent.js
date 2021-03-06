// A system for plugins to regiser perms for adding other perms

// call app.perms.addPermListener(perm, (async)listener), where listener recieves a hook context, and should return true or false whether to allow the perm to be added.

const errors = require('@feathersjs/errors');
const checkPerm = require('./checkPerm');
const comparePerm = require('./comparePerm');

const defaultListener = perms => async (context) => {
  if (!Array.isArray(perms)) perms = [perms];
  return !!perms.find(perm=>checkPerm(perm, context.params.user));
};

const register = {};

module.exports = {
  register,
  addPermListener (perm, listener) {
    if (typeof listener !== 'function') listener = defaultListener(listener);
    register[perm] = listener;
  },
  removePermListener (perm) {
    delete register[perm];
  },
  async hook (context) {
    const { data, existing, params } = context;
    if (!params.provider) return context;
    let perm = data ? data.perm : existing.perm; 
    if(typeof perm === 'string') perm = perm.split('.');
    let allow = false;
    if (['*', 'superadmin'].indexOf(perm[0]) !== -1) {
      allow = checkPerm('superadmin.perms.write', context.params.user);
    } else {
      const lists = Object.keys(register).filter(i => comparePerm(i, perm));
      allow = (await Promise.all(lists.map(i=>register[i](context, perm)))).indexOf(true) !== -1;
    }
    if(!allow) throw new errors.Forbidden('You do not have the required permissions to add this permission to this user.');
    return context;
  },
};
