// issues-model.js - A mongoose model

const DefaultSchema = require('../types/default.schema');
const nameType = require('../types/name.type');
const descType = require('../types/desc.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');

  const issues = DefaultSchema(app);
  issues.add({
    title: nameType(),
    body: descType(false, 4096),
    labels: [{
      type: String,
      enum: ['bug', 'enhancement', 'invalid'],
    }],
  });

  return mongooseClient.model('issues', issues);
};
