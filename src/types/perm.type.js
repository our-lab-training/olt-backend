module.exports = (required=true, opts={}) => {return {
  type: [{
    type: String,
    match: [/^(\w|\*){1,96}$/, 'Invalid permission provided.'],
  }],
  set: v => typeof v === 'string' ? v.split('.') : v, 
  required,
  ...opts,
};};