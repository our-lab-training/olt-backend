const {
  AuthenticationService,
  JWTStrategy,
} = require('@feathersjs/authentication');
const { AuthenticationBaseStrategy } = require('@feathersjs/authentication');
const custom = require('./auth/custom.strategy');
const phemeVerifierConstructor = require('./auth/pheme.verifier');
const Strategy = require('passport-custom');
const { LocalStrategy } = require('@feathersjs/authentication-local');



module.exports = function (app) {

  // SETUP AUTHENTICATION SERVICE
  const authentication = new AuthenticationService(app);
  authentication.register('jwt', new JWTStrategy());

  const PhemeStrategy = phemeVerifierConstructor(app);
  authentication.register('local', new PhemeStrategy());

  // app.configure(custom('local', phemeVerifier));

  // // The `authentication` service is used to create a JWT.
  // // The before `create` hook registers strategies that can be used
  // // to create a new valid JWT (e.g. local or oauth2)
  // app.service('authentication').hooks({
  //   before: {
  //     create: [
  //       authentication.hooks.authenticate(config.strategies)
  //     ],
  //     remove: [
  //       authentication.hooks.authenticate('jwt')
  //     ]
  //   }
  // });
  app.use('/authentication', authentication);
};
