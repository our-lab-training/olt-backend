const fs = require('fs');
const checkPerm = require('../lib/checkPerm');

module.exports = (app) => {
  app.plugins = {};
  const dirs = fs.readdirSync(__dirname);
  const permFuncs = [];
  app.groupPerms = groupId => [
    { text: 'Group - Override All Permissions', value: `${groupId}.*`, defaultRoles: ['admin'] },
    { text: 'Group - Manage Group', value: `${groupId}.group.write`, defaultRoles: ['admin'] },
    { text: 'Group - Joined', value: `${groupId}.enrolled`, defaultRoles: [] },
    { text: 'Users & Perms - View', value: `${groupId}.users.read`, defaultRoles: ['admin'] },
    { text: 'Users & Perms - Edit', value: `${groupId}.users.write`, defaultRoles: ['admin'] },
    ...permFuncs.reduce((a, p) => [...a, ...p(groupId)] ,[]),
  ];
  for(let dir of dirs){
    let config = null;
    try {
      if(!fs.statSync(`${__dirname}/${dir}`).isDirectory()) continue;
      if(!fs.statSync(`${__dirname}/${dir}/api`).isDirectory()) continue;
      /* config = require(`${__dirname}/${dir}/plugin.json`);
      config.ref = config.ref || dir;
      app.plugins[config.ref] = config; */
      app.configure(require(`${__dirname}/${dir}/api/`));
      permFuncs.push(require(`${__dirname}/${dir}/perms`));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      if(config && config.ref && app.plugins[config.ref]) delete app.plugins[config.ref];
    }
  }
  app.groupPerms('*').forEach(p => app.perms.addPermListener(p.value, async (context, perm) => {
    const { params} = context;
    const groupId = perm[p.value.split('.').findIndex(n => n === '*')];
    return checkPerm(`${groupId}.users.write`, params.user);
  }));
};