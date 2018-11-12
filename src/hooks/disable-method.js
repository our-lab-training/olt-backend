// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const errors = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { params } = context;
    if(!params.overrideSafeRemove && params.provider) throw new errors.BadRequest('Method Disabled.');
    return context;
  };
};
