// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const { service, data, params } = context;

    const perms = await service.find({query: {perm: data.perm, grantee: data.grantee, enabled: {$in: [true, false]}}, paginate: false});
    if(perms.length < 1) return context;
    let perm = perms[0];
    if(!perm.enabled){
      params.overrideSafeRemove = true;
      perm = service.patch(perm._id, {enabled: true}, params);
    }
    context.result = perm;

    return context;
  };
};
