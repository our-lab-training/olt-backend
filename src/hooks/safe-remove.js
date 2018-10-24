// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    context.params.isSafeRemove = true;
    context.result = await context.service.patch(context.id, {enabled: false}, context.params);
    // console.log(context.result.enabled); // eslint-disable-line no-console
    return context;
  };
};
