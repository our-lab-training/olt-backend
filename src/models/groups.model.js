// groups-model.js - A mongoose model

const DefaultSchema = require('../types/default.schema');
const nameType = require('../types/name.type');
const descType = require('../types/desc.type');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { plugins } = app;
  
  const groups = DefaultSchema(app);
  groups.add({
    name: nameType(),
    desc: descType(),
    logo: ObjectIdType('content', app, false),
    icon: {
      type: String,
      maxlength: 64,
      default: 'group',
    },
    type: {
      type: String,
      required: true,
      enum: ['public', 'private', 'global', 'template'],
      default: 'private',
    },
    plugins: {
      type: [{
        type: String,
        required: true,
        enum: Object.keys(plugins),
      }],
      required: true,
      default: [],
    },
    slugs: {
      type: [{
        type: String,
        maxlength: [256, 'the slug/name is too long.'],
        match: [/^[\w-]+$/, 'invalid characters in slug'],
        lowercase: true,
      }],
      required: true,
    },
  });

  return mongooseClient.model('groups', groups);
};
