const request = require('request-promise-native');

module.exports = (app) => async (req, done) => {
  try {
    const { username, password } = req.query;
    const body = await request({
      method: 'POST',
      uri: 'https://auth.makeuwa.com/api/login',
      body: {
        user: username,
        pass: password,
        token: process.env.AUTH_TOKEN,
      },
      json: true,
    });
    if(!body.success) throw new Error(body.message);
    const users = app.service('users').find({internalId: body.user.username});
    let user = null;
    if(users.length === 0) {
      user = app.service('users').create({
        internalId: body.user.username,
        email: body.user.email,
        profile: {
          name: {
            first: body.user.firstname,
            last: body.user.lastname,
          }
        }
      });
    } else user = users[0];
    done(null, user);
  } catch(err){
    done(null, false, {message: err.message});
  }
};