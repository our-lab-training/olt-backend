const {Schema} = require('mongoose');
const _ = require('lodash');

module.exports = (field, app, required = true) => {return {
  type: Schema.Types.ObjectId,
  required,
  validate: async function(v){
    if(!v) throw new Error(`${_.get(this, field)} reference is required.`);
    const row = await app.service(_.get(this, field)).get(v);
    if(!row) throw new Error(`${_.get(this, field)} reference does not exist.`);
  },
};};