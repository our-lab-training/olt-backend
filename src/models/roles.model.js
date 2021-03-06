// roles-model.js - A mongoose model

const DefaultSchema = require('../types/default.schema');
const nameType = require('../types/name.type');
const descType = require('../types/desc.type');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const roles = DefaultSchema(app);
  roles.add({
    name: nameType(),
    desc: descType(),
    groupId: ObjectIdType('groups', app),
    addOnJoin: {
      type: Boolean,
      default: false,
    },
  });

  return mongooseClient.model('roles', roles);
};
