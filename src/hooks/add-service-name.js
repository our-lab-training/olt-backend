// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const { service, app } = context;

    for(let i in app.services){
      if(app.services[i] === service){
        context.serviceName = i;
        break;
      }
    }

    return context;
  };
};
