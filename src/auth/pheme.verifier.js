const request = require('request-promise-native');

if(process.env.NODE_ENV !== 'production'){
  console.warn('Warning: not in production mode, enabling demo user'); // eslint-disable-line
}

module.exports = (app) => async (req, done) => {
  try {
    const { username, password } = req.query;
    const isDemoUser = process.env.NODE_ENV !== 'production' && username === '12345678' && password === 'demo';
    let body = null;
    if(isDemoUser){
      body = {success: true, user: {username, email: '12345678@example.uwa.edu.au', firstname: 'Jo', lastname: 'Blogs'}};
    } else {
      body = await request({
        method: 'POST',
        uri: 'https://auth.systemhealthlab.com/api/login',
        body: {
          user: username,
          pass: password,
          token: process.env.AUTH_TOKEN,
        },
        json: true,
      });
    }
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
      if(isDemoUser){
        await app.service('perms').create({perm: ['*'], type: 'users', grantee: user._id});
      }
    } else user = users[0];
    done(null, user, {userId: user._id});
  } catch(err){
    done(null, false, {message: err.message});
  }
};