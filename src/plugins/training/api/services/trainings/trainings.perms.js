module.exports = (app) => {
  app.perms.addPermListener('trainings.*.accept', async (context, perm) => {
    const { params, data, existing } = context;
    const { grantee } = existing || data;
    if(grantee !== params.user._id +'') return false;
    const stepId = perm[1];
    const trains = await app.service('trainings').find({ query: {steps: { $elemMatch: { _id: stepId } } }, paginate: false });
    if (!trains.length) return false;
    const train = trains[0];
    if (!train.public && params.user.perms.groups.indexOf(`${train.groupId}`) === -1) return false;
    const step = train.steps.find(s => `${s._id}` === stepId);
    if (!step.required) return false;
    if (step.type === 'comment-link') return true;
    if (step.type === 'doc' && step.docType === 'content') return true;
    return false;
  });
};
