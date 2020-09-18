const {
  AuthenticationService,
  JWTStrategy,
} = require('@feathersjs/authentication');
const phemeVerifierConstructor = require('./auth/pheme.verifier');


module.exports = function (app) {

  // SETUP AUTHENTICATION SERVICE
  const authentication = new AuthenticationService(app);
  authentication.register('jwt', new JWTStrategy());

  const PhemeStrategy = phemeVerifierConstructor(app);
  authentication.register('local', new PhemeStrategy());

  app.use('/authentication', authentication);
};
