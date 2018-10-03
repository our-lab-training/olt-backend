module.exports = (required=[true, 'Name is required.'], length=256, opts) => {return {
  type: String,
  maxLength: [length, `Name cannot be longer than ${length} characters`],
  trim: true,
  required,
  ...opts
};};
