// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// const _ = require('lodash');
const errors = require('@feathersjs/errors');
const checkPerm = require('../lib/checkPerm');
const comparePerm = require('../lib/comparePerm');
const { ObjectId } = require('mongoose').Types;
const _ = require('lodash');


// eslint-disable-next-line no-unused-vars
module.exports = function (opts = {}) {
  if (opts.perms) opts.perms = Array.isArray(opts.perms) ? opts.perms : [opts.perms];
  return async context => {
    const {params, serviceName} = context;
    if(!params.provider) return context;
    if(!params.user) throw new errors.NotAuthenticated('You must be logged in.');
    if(opts.override && checkPerm(opts.override, params.user)) return context;
    
    opts.id = opts.id || (serviceName === 'groups' ? '_id' : 'groupId');
    opts.include = opts.include || (serviceName === 'groups' ? ['public', 'global'] : ['global']);

    const groups = _.uniq(opts.perms ? params.user.perms.all.reduce((a, perm) => {
      const match = opts.perms.reduce((a, p) => comparePerm(p.replace('{groupId}', '*'), perm, false) ? p : a, null);
      return match ? [...a, perm[match.split('.').indexOf('{groupId}')]] : a;
    }, []) : params.user.perms.groups).filter(gid => /[0-9abcdef]{24}/.test(gid));

    const andarr = params.query.$and = params.query.$and || [];
    const groupsIdFilter = {};
    groupsIdFilter[opts.id] = {$in: groups};
    
    if(serviceName === 'groups'){
      andarr.push({$or: [
        groupsIdFilter,
        {type: {$in: opts.include}},
      ]});
    } else {
      andarr.push(groupsIdFilter);
    }

    return context;
  };
};
