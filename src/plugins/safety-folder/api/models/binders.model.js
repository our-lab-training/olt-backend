// Trainings-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const DefaultSchema = require('../../../../types/default.schema');
const DescType = require('../../../../types/desc.type');
const NameType = require('../../../../types/name.type');
const ObjectIdType = require('../../../../types/objectId.type');
// const TypedObjectIdType = require('../../../../types/typedObjectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const itemSchema = new Schema({
    type: {
      type: String,
      required: true,
      enum: ['content', 'quizzes', 'inductions'],
      default: function() {
        switch (this.category) {
        case 'induct':
          return 'inductions';
        case 'quiz':
          return 'quizzes';
        default:
          return 'content';
        }
      },
    },
    itemId: {
      type: Schema.Types.ObjectId,
    },
    category: {
      type: String,
      required: true,
      enum: ['sop', 'risk-ass', 'manual', 'meth-state', 'other', 'quiz', 'induct'],
    },
  }, {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  });

  const binders = DefaultSchema(app);
  
  binders.add({
    name: NameType(),
    desc: DescType(),
    priority: {
      type: Number,
      required: [true, 'A priority is required to order the binder.'],
      default: 50,
    },
    type: {
      type: String,
      required: [true, 'Type is required, please select one.'],
      enum: ['workspace', 'task', 'tool'],
    },
    items: {
      type: [itemSchema],
      required: true,
      default: [],
    },
    public: {
      type: Boolean,
      required: true,
      default: false,
    },
    groupId: ObjectIdType('groups', app),
  });
  return mongooseClient.model('binders', binders);
};