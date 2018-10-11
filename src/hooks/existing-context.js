// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const errors = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const {service, app, id} = context;
    let serviceName = context.serviceName = null;
    for(let i in app.services){
      if(app.services[i] === service){
        serviceName = i;
        break;
      }
    }
    if(serviceName === 'authentication') return context;
    console.log(serviceName);
    context.existing = await app.service(serviceName).get(id);
    if(!context.existing) throw new errors.NotFound('Id provided does not exist.');

    if(context.data) context.data.enabled = context.existing.enabled;
    return context;
  };
};
