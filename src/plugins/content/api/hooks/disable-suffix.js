
const errors = require('@feathersjs/errors');
const { v4: uuidv4 } = require('uuid');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { existing, service, id } = context;
    context.existing = await service.patch(id, {name: `${existing.name}.disabled.${uuidv4()}`});
    return context;
  };
};