module.exports = (required=[true, 'Name is required.'], opts) => {return {
    type: String,
    maxLength: [256, 'Name cannot be longer than 256 characters'],
    trim: true,
    required,
    ...opts
}};