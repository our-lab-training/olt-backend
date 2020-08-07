
const errors = require('@feathersjs/errors');
const uuidv4 = require('uuid/v4');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { existing, service, id } = context;
    context.existing = await service.patch(id, {name: `${existing.name}.disabled.${uuidv4()}`});
    return context;
  };
};