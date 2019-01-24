module.exports = (app) => {
  app.service('roles').publish(data => {
    return app.channel(`groupIds/${data.groupId}`);
  });
};