// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = function (fields, options = {}) {
  if(!Array.isArray(fields)) fields = [fields];

  const resolveResult = async (result) => {
    //const returnResult = result._doc;
    await Promise.all(fields.map(async (field) => {
      let value = _.get(result, field);
      if(value instanceof Promise) value = await value;
      //console.log(result);
      _.set(result._doc, field, value);
    }));
    return result._doc;
  }

  return async context => {
    let {method} = context;
    if(method !== 'find') context.result = await resolveResult(context.result);
    else context.result = await Promise.all(context.result.map(resolveResult));
    //console.log(await resolveResult(context.result));
    return context;
  };
};
