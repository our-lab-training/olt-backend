// perms-model.js - A mongoose model

const DefaultSchema = require('../types/default.schema');
const typedObjectIdType = require('../types/typedObjectId.type');
const permType = require('../types/perm.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');

  const perms = DefaultSchema(app);
  perms.add({
    type: {
      type: String,
      required: true,
      enum: ['users', 'roles'],
    },
    grantee: typedObjectIdType('type', app),
    perm: permType(),
  });

  return mongooseClient.model('perms', perms);
};
