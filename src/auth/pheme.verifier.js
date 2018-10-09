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
    const users = await app.service('users').find({query: {username: body.user.username}, paginate: false});
    let user = null;
    if(users.length === 0) {
      user = await app.service('users').create({
        username: body.user.username,
        email: body.user.email,
        profile: {
          firstname: body.user.firstname,
          lastname: body.user.lastname,
          displayname: body.user.firstname,
        }
      });
    } else user = users[0];
    done(null, user, {userId: user._id});
  } catch(err){
    done(null, false, {message: err.message});
  }
};