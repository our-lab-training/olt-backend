// events-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const DefaultSchema = require('../types/default.schema');
const nameType = require('../types/name.type');
const ObjectIdType = require('../types/objectId.type');
const permType = require('../types/perm.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const events = DefaultSchema(app);
  events.add({
    name: nameType(),
    groupId: ObjectIdType('groups', app),
    triggers: [{
      triggerType: {
        type: String,
        enum: ['perm-create', 'perm-remove'],
        required: true,
      },
      perm: permType(false),
    }],
    actions: [{
      actionType: {
        type: String,
        enum: ['notify', 'perm-create', 'perm-remove'],
      },
      perm: permType(false),
      ntId: ObjectIdType('notify-templates', app, false),
    }],
  });

  return mongooseClient.model('events', events);
};
