// notify-template-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const DefaultSchema = require('../types/default.schema');
const descType = require('../types/desc.type');
const nameType = require('../types/name.type');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const notifyTemplate = DefaultSchema(app);
  notifyTemplate.add({
    groupId: ObjectIdType('groups', app),
    subject: nameType(),
    text: descType(undefined, 4096),
    short: descType(undefined, 160),
    to: String,
    cc: String,
    bcc: String,
    sendToUsers: {
      type: Boolean,
      required: true,
      default: false,
    },
    groupUsers: {
      type: Boolean,
      required: true,
      default: false,
    },
    sendOn: {
      type: String,
      required: true,
      enum: ['instant', 'weekly'],
      default: 'instant',
    },
    sendOnHour: {
      type: Number,
      min: [0, 'the hour must be between 0 and 23'],
      max: [23, 'the hour must be between 0 and 23'],
      default: 8,
    },
    sendOnDay: [{
      type: Number,
      min: [0, 'the day must be between 0 and 6'],
      max: [6, 'the day must be between 0 and 6'],
      default: 0,
    }],
  });

  return mongooseClient.model('notifyTemplate', notifyTemplate);
};
