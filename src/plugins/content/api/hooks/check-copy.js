
const errors = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { data, service, app, result } = context;
    if(!data.copy) return context;
    const copy = await service.get(data.copy);
    if(!copy) throw new errors.NotFound('Copy content could not be found.');
    const res = await app.buckets.private.copyObject({
      CopySource: `/${copy.bucket}/${copy.key}`,
      Key: result.key,
    });
    context.result = await service.patch(result._id, {md5: res.CopyObjectResult.ETag.replace(/"/g, '')});
    return context;
  };
};