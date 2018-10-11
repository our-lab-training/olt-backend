// Users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const DefaultSchema = require('../types/default.schema');
const NameType = require('../types/name.type');
const PhemeIdType = require('../types/phemeId.type');
const EmailType = require('../types/email.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const {isValid} = mongooseClient.Types.ObjectId;
  const users = DefaultSchema(app);
  users.add({
    username: PhemeIdType(),
    profile: {
      firstname: NameType(),
      lastname: NameType(),
      title: {
        type: String,
        required: false,
        enum: ['Dr', 'Mr', 'Mrs', 'Ms'],
      },
      displayname: NameType(),
    },
    email: EmailType(),
  });

  users.virtual('perms').get(async function(){
    const perms = {};
    perms.userperms = await app.service('perms').find({query: {grantee: this._id}, paginate: false});
    perms.roles = perms.userperms.reduce((a, up)=>{
      const i = up.perm.indexOf('roles');
      if(i !== -1 && isValid(up.perm[i+1])) a.push(up.perm[i+1]);
      return a;
    }, []);
    perms.roleperms = await app.service('perms').find({query: {grantee: {$in: perms.roles}}, paginate: false});
    perms.all = [...perms.userperms.map(p=>p.perm), ...perms.roleperms.map(p=>p.perm)];
    perms.groups = perms.userperms.reduce((a, up)=>{
      const i = up.perm.indexOf('enrolled');
      if(i !== -1 && isValid(up.perm[i-1])) a.push(up.perm[i-1]);
      return a;
    }, []);
    return perms;
  });
  
  return mongooseClient.model('users', users);
};
