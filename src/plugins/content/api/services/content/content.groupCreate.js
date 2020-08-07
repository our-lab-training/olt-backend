const _ = require('lodash');

const defaultContent = [
  {
    name: '.directory',
    perms: [
      'superadmin.content.deleteroots',
    ],
    type: 'text/x-directory'
  },
];

module.exports = (app) => {
  app.groupCreate.addListener(async (group, template) => {

    // populate content, depending if the template is defined or not
    let contents = [];
    if(!template) contents = _.cloneDeep(defaultContent);
    else {
      contents = await app.service('content').find({query: {groupId: template._id}, paginate: false});
    }

    await Promise.all(contents.map(async (content) => {
      // create content
      // const parts = content.name.split('/');
      // parts.shift();
      // parts.unshift(group._id);
      // content.name = parts.join('/');
      delete content._id;
      content.groupId = group._id;
      await app.service('content').create(content);
    }));
  });
};
