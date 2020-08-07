// induction-model.js - A mongoose model

const DefaultSchema = require('../../../../types/default.schema');
const nameType = require('../../../../types/name.type');
const ObjectIdType = require('../../../../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const completedInductions = DefaultSchema(app);
  completedInductions.add({
    inductId: ObjectIdType('inductions', app),
    proofId: ObjectIdType('content', app, false),
    proofMd: String,
    userIds: [ObjectIdType('users', app)],
    list: [{
      name: nameType(),
      children: [{
        name: nameType(),
        checked: {
          type: Boolean,
          default: false,
          required: true,
        },
      }],
    }],
    done: {
      type: Boolean,
      default: false,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    inductorName: nameType(false),
    inductorId: ObjectIdType('users', app, false),
  });

  return mongooseClient.model('completed-inductions', completedInductions);
};
