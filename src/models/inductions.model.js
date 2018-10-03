// induction-model.js - A mongoose model

const DefaultSchema = require('../types/default.schema');
const nameType = require('../types/name.type');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const inductions = DefaultSchema(app);
  inductions.add({
    name: nameType(),
    content: [ObjectIdType('content', app)],
  });

  return mongooseClient.model('inductions', inductions);
};
