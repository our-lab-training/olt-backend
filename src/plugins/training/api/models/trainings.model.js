// Trainings-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const DefaultSchema = require('../../../../types/default.schema');
const NameType = require('../../../../types/name.type');
const ObjectIdType = require('../../../../types/objectId.type');
const PermType = require('../../../../types/perm.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const stepSchema = new Schema({
    type: {
      type: String,
      required: true,
      enum: ['doc', 'comment-link', 'perm-timeout'], // TODO: abstract to config 
    },
    name: NameType(),
    docId: Schema.Types.ObjectId,
    docType: {
      type: String,
      enum: ['content', 'inductions', 'quizzes'],
    },
    link: {
      type: String,
      maxLength: [1024, 'link is too long, try a url shortener.'],
      match: [/https?:\/\/[\w-]+\.[\w-]+((\?|\/|#).*)?/, 'Invalid link provided.'],
    },
    perm: PermType(),
    duration: {
      type: Number,
      min: [0, 'You cannot have negative days...'],
      max: [365, 'Cannot be longer than a year'],
    },
    index: {
      type: Number,
      min: [0, 'Index cannot be lower than 0'],
    },
    required: {
      type: Boolean,
      required: true,
      default:  function () {
        return this.type !== 'content';
      } 
    }
  }, {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  });

  const trainings = DefaultSchema(app);
  
  trainings.add({
    name: NameType(),
    priority: { 
      type: Number, 
      required: [true, 'A priority is required to order the trainings.'],
      default: 50,
    },
    steps: { 
      type: [stepSchema],
      required: true,
      default: [],
    },
    published: {
      type: Date,
    },
    public: {
      type: Boolean,
      required: true,
      default: false,
    },
    bindId: ObjectIdType('binders', app),
    groupId: ObjectIdType('groups', app),
  });
  return mongooseClient.model('trainings', trainings);
};