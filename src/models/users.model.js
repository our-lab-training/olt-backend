// Users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const DefaultSchema = require('../types/default.schema');
const NameType = require('../types/name.type');
const PhemeIdType = require('../types/phemeId.type');
const EmailType = require('../types/email.type');
const { Mixed } = require('mongoose').Schema.Types;

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const users = DefaultSchema(app);
  users.add({
    username: PhemeIdType(),
    profile: {
      firstname: NameType(),
      lastname: NameType(),
      title: {
        type: String,
        required: false,
        enum: ['Dr', 'Mr', 'Mrs', 'Ms'],
      },
      displayname: NameType(),
    },
    email: EmailType(),
    perms: {
      type: Mixed,
      required: true,
      default: {
        all: [],
        userperms: [],
        groups: [],
        roles: [],
        roleperms: [],
      },
    },
  });
  
  return mongooseClient.model('users', users);
};
