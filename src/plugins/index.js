const fs = require('fs');

module.exports = (app) => {
  app.plugins = {};
  const dirs = fs.readdirSync(__dirname);
  for(let dir of dirs){
    let config = null;
    try {
      if(!fs.statSync(`${__dirname}/${dir}`).isDirectory()) continue;
      if(!fs.statSync(`${__dirname}/${dir}/api`).isDirectory()) continue;
      /* config = require(`${__dirname}/${dir}/plugin.json`);
      config.ref = config.ref || dir;
      app.plugins[config.ref] = config; */
      app.configure(require(`${__dirname}/${dir}/api/`));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      if(config && config.ref && app.plugins[config.ref]) delete app.plugins[config.ref];
    }
  }
};