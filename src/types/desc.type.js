
module.exports = (required=[false, 'Name is required.'], length=1024, opts) => {return{
  type: String,
  maxlength: [length, `The description cannot exceed ${length} characters`],
  trim: true,
  required,
  ...opts
};};