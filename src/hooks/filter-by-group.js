// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const _ = require('lodash');
const errors = require('@feathersjs/errors');
const checkPerm = require('../lib/checkPerm');

// eslint-disable-next-line no-unused-vars
module.exports = function (opts = {}) {
  return async context => {
    const {params, serviceName} = context;
    if(!params.provider) return context;
    if(!params.user) throw new errors.NotAuthenticated('You must be logged in.');
    if(opts.override && checkPerm(opts.override, params.user)) return context;
    
    opts.id = opts.id || serviceName === 'groups' ? '_id' : 'groupId';
    const andarr = params.query.$and = params.query.$and || [];
    const groupsIdFilter = _.set({}, opts.id, {$in: params.user.perms.groups});
    
    if(serviceName === 'groups'){
      andarr.push({$or: [
        groupsIdFilter,
        {type: {$in: ['public', 'global']}},
      ]});
    } else {
      andarr.push(groupsIdFilter);
    }

    return context;
  };
};
