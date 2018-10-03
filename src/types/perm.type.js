module.exports = (required=true) => {return {
  type: [{
    type: String,
    match: [/^\w{1,96}$Z/, 'Invalid permission provided.'],
  }],
  set: v => typeof v === 'string' ? v.split('.') : v, 
  required
};};