// induction-model.js - A mongoose model

const DefaultSchema = require('../../../../types/default.schema');
const nameType = require('../../../../types/name.type');
const descType = require('../../../../types/desc.type');
const ObjectIdType = require('../../../../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const inductions = DefaultSchema(app);
  inductions.add({
    name: nameType(),
    desc: descType(),
    groupId: ObjectIdType('groups', app),
    bookingDesc: descType(),
    showInductors: {
      type: Boolean,
      default: true,
      required: true,
    },
    public: {
      type: Boolean,
      default: false,
      required: true,
    },
    published: {
      type: Date,
    },
    list: [{
      name: nameType(),
      desc: descType(),
      children: [{
        name: nameType(),
        desc: descType(),
      }],
    }],
  });

  return mongooseClient.model('inductions', inductions);
};
