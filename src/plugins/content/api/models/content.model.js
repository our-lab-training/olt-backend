// content-model.js - A mongoose model

const DefaultSchema = require('../../../../types/default.schema');
const ObjectIdType = require('../../../../types/objectId.type');
const supportedFiles = require('../../supportedFiles');
const exts = Object.values(supportedFiles).reduce((a, type) => [...a, ...type.ext], []);

module.exports = function (app) {
  
  const mongooseClient = app.get('mongooseClient');
  const content = DefaultSchema(app);
  content.add({
    name: {
      type: String,
      unique: false,
      match: [/^[^\\/:*"<>|]+$/, 'Invalid charaters used in filename.'],
      required: [true, 'A file name is required'],
    },
    parent: ObjectIdType('content', app, false),
    groupId: ObjectIdType('groups', app),
    perms: [{
      type: String,
      maxLength: 256,
    }],
    bucket: {
      type: String,
      required: true,
      default: process.env.AWS_BUCKET_PRIVATE,
    },
    region: {
      type: String,
      required: true,
      default: process.env.AWS_REGION,
    },
    type: {
      type: String,
      required: [true, 'A file type is required'],
      enum: Object.keys(supportedFiles),
    },
    ext: {
      type: String,
      required: [true, 'A file extension is required'],
      enum: exts,
      default: function(){ return supportedFiles[this.type].ext[0]; },
    },
  });

  return mongooseClient.model('content', content);
};
