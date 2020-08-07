// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const { getItems, replaceItems } = require('feathers-hooks-common');
const moment = require('moment');

const { readFileSync } = require('fs');
const source = readFileSync(`${__dirname}/templates/training.hbs`, {encoding: 'utf-8'});

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { app, params } = context;
    if (!params.user) return context;
    const paginate = app.get('paginate');

    const checkComplete = async (item) => {
      item.binder = await app.service('binders').get(item.bindId);
      const appendixRefs = [];
      await Promise.all(item.steps.map(async (step) => {
        if (!step.required) return;
        let query = { perm: step.perm, grantee: params.user._id, $limit: 0 };
        if (step.type === 'perm-timeout' && step.duration > 0) {
          query.createdAt = { $lte: new Date(Date.now() - step.duration * 24 * 60 * 60 * 1000) };
        } else if (step.type === 'comment-link') {
          query.perm = ['trainings', `${step._id}`, 'accept'];
        } else if(step.type === 'doc') {
          if (step.docType === 'content') query.perm = ['trainings', `${step._id}`, 'accept'];
          else {
            query.perm = [step.docType, `${(item.binder.items.find(i => `${i._id}` === `${step.docId}`) || {}).itemId}`, 'complete'];
            appendixRefs.push({ docType: step.docType, docId: query.perm[1] });
          }
        } else return;
        const { total } = await app.service('perms').find({ query, paginate });
        if (total) step.complete = true;
      }));
      const res = await app.service('perms').find({
        query: {
          perm: ['trainings', `${item._id}`, 'complete'],
          grantee: params.user._id,
        },
      });
      if (res[0] && res[0].data && res[0].data.proofId){
        item.complete = true;
        item.proofId = res[0].data.proofId;
        return;
      }
      if(item.steps.find(s => s.required && !s.complete)) return;
      item.complete = true;

      const appendix = [];
      await Promise.all(appendixRefs.map(async (ref) => {
        if (ref.docType === 'inductions') {
          const res = await app.service('completed-inductions').find({
            query: { inductId: ref.docId, userIds: params.user._id },
          });
          if (res.data[0] && res.data[0].proofId) appendix.push(res.data[0].proofId);
        }
      }));

      const date = (res[0] && res[0].createdAt) || Date.now();
      const { doc, md } = await app.docGen(source, {
        user: params.user,
        date,
        training: item,
        group: await app.service('groups').get(item.groupId),
        appendix,
      }, {
        path: `Training/${item._id}/evidence`,
        filename: `${params.user.text.replace(/[^\w ]/g, '').replace(/ /g, '_')}_${moment(date).format('YYYY-MM-DD')}.pdf`,
        groupId: item.groupId,
        appendix,
      });
      const permData = { proofId: doc._id, proofMd: md };
      item.proofId = doc._id;

      if (res[0]) {
        await app.service('perms').patch(res[0]._id, { data: permData });
      } else {
        await app.service('perms').create({
          perm: ['trainings', `${item._id}`, 'complete'],
          grantee: params.user._id,
          type: 'users',
          data: permData,
        });
      }
    };

    const items = getItems(context);
    if (Array.isArray(items)) await Promise.all(items.map(checkComplete));
    else await checkComplete(items);

    replaceItems(context, items);

    return context;
  };
};
