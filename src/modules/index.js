const fs = require('fs');

module.exports = (app) => {
  app.modules = {};
  const dirs = fs.readdirSync('./');
  for(let dir of dirs){
    try {
      if(!fs.statSync(`./${dir}`).isDirectory()) continue;
      const config = require(`./${dir}/module.json`);
      config.ref = config.ref || dir;
      app.configure(require(`./${dir}/api/index`));
      app.modules[config.ref] = config;
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
    }
  }
};