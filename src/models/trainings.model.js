// Trainings-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const DefaultSchema = require('../types/default.schema');
const NameType = require('../types/name.type');
const ObjectIdType = require('../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const itemSchema = new Schema({
    type: {
      type: String,
      required: true,
      enum: ['content', 'quizzes', 'inductions'], // TODO: abstract to config 
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      validate: async function(v){
        if(!v) throw new Error(`${this.type} reference is required.`);
        const row = await app.service(this.type).get(v);
        if(!row) throw new Error(`${this.type} reference does not exist.`);
      },
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

  itemSchema.virtual('name').get(async function () {
    const item = await app.service(this.type).get(this.itemId);
    return this.type === 'content' ? item.name : `Complete ${item.name}`;
  });

  const trainings = DefaultSchema(app);
  
  trainings.add({
    name: NameType(),
    priority: { 
      type: Number, 
      required: [true, 'A priority is required to order the trainings.'] 
    },
    items: { 
      type: [itemSchema],
      required: true,
      default: [],
    },
    public: {
      type: Boolean,
      required: true, 
    },
    groupId: ObjectIdType('groups', app),
  });
  return mongooseClient.model('trainings', trainings);
};
