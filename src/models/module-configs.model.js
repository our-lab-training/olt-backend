// moduleConfigs-model.js - A mongoose model

//TODO setup with discriminators https://mongoosejs.com/docs/discriminators.html

const DefaultSchema = require('../types/default.schema');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');

  const moduleConfigs = DefaultSchema(app);
  moduleConfigs.add({
    groupId: ObjectIdType('groups', app),
    module: {
      type: String,
      required: true,
      enum: app.modulesList
    }
  });

  return mongooseClient.model('moduleConfigs', moduleConfigs);
};
