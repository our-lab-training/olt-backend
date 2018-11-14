// A system for plugins to regiser perms for adding other perms

// call app.groupCreate.addListener((async)listener), where listener recieves the new group and, if specified, the template to copy from.

// const errors = require('@feathersjs/errors');

const register = [];

module.exports = {
  register,
  addListener (listener) {
    return register.push(listener);
  },
  removeListener (i) {
    return register.splice(i, 1);
  },
  async hook (context) {
    const { data, result, service } = context;

    let template = null;
    if(data.template) template = await service.get(data.template);
    
    await Promise.all(register.map(listener=>listener(result, template, context)));

    return context;
  },
};
