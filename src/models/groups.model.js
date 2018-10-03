// groups-model.js - A mongoose model

const DefaultSchema = require('../types/default.schema');
const nameType = require('../types/name.type');
const descType = require('../types/desc.type');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  
  const groups = DefaultSchema(app);
  groups.add({
    name: nameType(),
    desc: descType(),
    logo: ObjectIdType('content', app, false),
    public: {
      type: Boolean,
      required: true,
      default: false,
    }
  });

  return mongooseClient.model('groups', groups);
};
