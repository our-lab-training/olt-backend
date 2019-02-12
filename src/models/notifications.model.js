// notifications-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const DefaultSchema = require('../types/default.schema');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const notifications = DefaultSchema(app);
  notifications.add({
    ntId: ObjectIdType('notify-templates', app),
    userIds: [ObjectIdType('users', app)],
    sendOn: {
      type: Date,
      required: true,
    },
    sent: {
      type: Boolean,
      required: true,
      default: false,
    },
  });

  return mongooseClient.model('notifications', notifications);
};
