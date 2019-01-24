const _ = require('lodash');

const defaultRoles = [
  {
    name: 'User',
    addOnJoin: true,
    perms: [],
  },
  {
    name: 'Moderator',
    addOnJoin: false,
    perms: [],
  },
  {
    name: 'Admin',
    addOnJoin: false,
    perms: [],
  },
];

module.exports = (app) => {
  app.groupCreate.addListener(async (group, template, context) => {
    const { params } = context;

    // populate roles, depending if the template is defined or not
    let roles = [];
    if(!template){
      roles = _.cloneDeep(defaultRoles);
      app.groupPerms(group._id).forEach(p => {
        if (p.defaultRoles) roles.forEach(r => {
          if (p.defaultRoles.indexOf(r.name.toLowerCase()) !== -1) r.perms.push(p.value);
        });
      });
    } else {
      roles = await app.service('roles').find({query: {groupId: template._id}, paginate: false});
      await Promise.all(roles.map(async (role) => {
        role.perms = (await app.service('perms').find({query: {grantee: role._id}, paginate: false})).map(perm=>perm.perm);
      }));
    }

    await Promise.all(roles.map(async (role) => {
      // create role
      delete role._id;
      role.groupId = group._id;
      const newRole = await app.service('roles').create(role);
      // create perms
      await Promise.all(role.perms.map(async (perm) => {
        if(Array.isArray(perm)) perm = perm.join('.');
        const reg = new RegExp(template ? template._id : '{groupId}', 'g');
        await app.service('perms').create({
          perm: perm.replace(reg, group._id),
          grantee: newRole._id,
          type: 'roles',
        });
      }));

      // give the creator the admin role
      if(params.user && role.name.toLowerCase() === 'admin') await app.service('perms').create({
        grantee: params.user._id,
        type: 'users',
        perm: `roles.${newRole._id}`,
      });

    }));
  });
};
