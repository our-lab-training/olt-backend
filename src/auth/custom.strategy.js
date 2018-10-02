const Strategy = require('passport-custom');

module.exports = (name, verifier) => {
  return function() {
    this.passport.use(name, new Strategy(verifier));
    this.passport.options(verifier, {});
  };
};