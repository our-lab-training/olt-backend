const mongoose = require('mongoose');

module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI || app.get('mongodb'), { useNewUrlParser: true });
  mongoose.Promise = global.Promise;

  app.set('mongooseClient', mongoose);
};
