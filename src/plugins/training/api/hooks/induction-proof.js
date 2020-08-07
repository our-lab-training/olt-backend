// const request = require('request-promise-native');
// const errors = require('@feathersjs/errors');
const { getItems, replaceItems } = require('feathers-hooks-common');
const _ = require('lodash');
const moment = require('moment');

const { readFileSync } = require('fs');
const source = readFileSync(`${__dirname}/templates/induction.hbs`, {encoding: 'utf-8'});

const inductionProof = async (context, item) => {
  if (item.proofId || !item.done) return item;
  const { app } = context;

  const induction = await app.service('inductions').get(item.inductId);
  const group = await app.service('groups').get(induction.groupId);
  const users = await app.service('users').find({ query: { _id: { $in: item.userIds } }, paginate: false });
  const inductor = await app.service('users').get(item.inductorId || item.createdBy);
  const date = new Date(item.completedAt || item.createdAt);

  const { doc, md } = await app.docGen(source, {
    users,
    inductor,
    induction,
    date,
    comp: item,
    group,
  }, {
    path: `Inductions/${item.inductId}/evidence`,
    filename: `${moment(date).format('YYYY-MM-DD_HH-mm')}.pdf`,
    groupId: induction.groupId,
  });
  item.proofId = doc._id;
  item.proofMd = md;
  return item;
};

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    if (context.existing && context.existing.proofId) return context;
    let items = getItems(context);

    if (Array.isArray(items)) items = await Promise.all(items.map(item => inductionProof(context, _.merge({}, context.existing || {}, item))));
    else items = await inductionProof(context, _.merge({}, context.existing || {}, items));
    
    replaceItems(context, items);
    return context;
  };
};