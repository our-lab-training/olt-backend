
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const field = context.method === 'create' ? 'createdBy' : 'updatedBy';
    let userId = null;
    if(context.params.user) user = context.params.user._id;
    context.data.updatedBy = userId;
    if(context.method === 'create'){
      context.data.createdBy = userId;
      context.data.enabled = true;
    } else {
      context.data.createdBy = context.existing.createdBy;
    }
    return context;
  };
};