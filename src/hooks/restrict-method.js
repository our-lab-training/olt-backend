// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const _ = require('lodash');
const errors = require('@feathersjs/errors');
const checkPerm = require('../lib/checkPerm');

// eslint-disable-next-line no-unused-vars
module.exports = function (permissions='*', opts = {}) {
  if(!Array.isArray(permissions)) permissions = [permissions];
  return async context => {
    const {params} = context;
    if(!params.provider) return context;
    if(!params.user) throw new errors.NotAuthenticated('You must be logged in.');

    for(let perm of permissions){
      const autofills = perm.match(/{[\w.[\]]+}/g) || [];
      for(let autofill of autofills) perm = perm.replace(autofill, _.get(context, autofill));
      const hasPerm = checkPerm(perm, params.user);
      if(!opts.all && hasPerm) return context;
      if(opts.all && !hasPerm) throw new errors.Forbidden('You do not have all the permissions required.');
    }
    if(!opts.all) throw new errors.Forbidden('You do not have the permissions required.');

    return context;
  };
};
