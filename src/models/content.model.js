// content-model.js - A mongoose model

const DefaultSchema = require('../types/default.schema');
const nameType = require('../types/name.type');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  
  const mongooseClient = app.get('mongooseClient');
  const content = DefaultSchema(app);
  content.add({
    name: nameType(),
    path: {
      type: String,
      match: /^[a-zA-Z0-9/-_.~]+$/,
      //required: true,
    },
    groupId: ObjectIdType('groups', app),
    module: {
      type: String,
      required: true,
      enum: app.modulesList,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'text/plain',
        'text/markdown',
        'text/uri-list',
        'text/x-comment',
        'text/csv',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/x-flv',
        'audio/mpeg',
        'audio/x-wav',
        'application/x-latex',
        'application/zip',
        'application/x-javascript',
        'application/json',
        'application/x-gzip',
        'application/pdf',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
    }
  });

  return mongooseClient.model('content', content);
};
