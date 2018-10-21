// moduleConfigs-model.js - A mongoose model

//TODO setup with discriminators https://mongoosejs.com/docs/discriminators.html

const DefaultSchema = require('../types/default.schema');
const ObjectIdType = require('../types/objectId.type');
const { Mixed } = require('mongoose').Schema.Types;

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { plugins } = app;

  const moduleConfigs = DefaultSchema(app);
  moduleConfigs.add({
    groupId: ObjectIdType('groups', app),
    module: {
      type: String,
      required: true,
      enum: Object.keys(plugins),
    },
    settings: {
      type: Mixed,
      validate: async function(v){
        if(!plugins[this.type]) throw new Error('Unknown plugin');
        if(!plugins[this.type].model && !v) return true;
        const config = new plugins[this.type].model(v);
        await config.validate();
        return true;
      },
    }
  });

  return mongooseClient.model('moduleConfigs', moduleConfigs);
};
