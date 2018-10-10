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
    type: {
      type: String,
      required: true,
      enum: ['public', 'private', 'global', 'template'],
      default: 'private',
    },
  });

  groups.virtual('public').get(function(){return this.type === 'private' || this.type === 'template'})

  return mongooseClient.model('groups', groups);
};
