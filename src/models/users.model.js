// Users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const users = new Schema({
    username: { 
      type: String, 
      required: true 
    },
    profile: {
      firstname: { 
        type: String, 
        required: true 
      },
      lastname: { 
        type: String, 
        required: true 
      },
      title: { 
        type: String, 
        required: true 
      },
      displayname: { 
        type: String, 
        required: true 
      },
    }
  }, {
    timestamps: true
  });

  return mongooseClient.model('users', users);
};
