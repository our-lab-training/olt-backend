// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const errors = require('@feathersjs/errors');
const expiry = 900;

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return context => {
    return new Promise( (resolve, reject) => {
      const { method, app, result, data } = context;
      const { key, type } = result;

      // ignore directories
      if(result.type === 'text/x-directory') return resolve(context);

      // depending on the method, get a diff type of presigned
      if (method === 'get') { // read
        app.buckets.private.getSignedUrl('getObject', { Key: key, Expires: expiry }, (err, url) => {
          if(err){
            console.error(err); // eslint-disable-line no-console
            return reject(new errors.GeneralError('Could not initiate download link, please contact an administrator.'));
          }
          context.result.presign = {
            method: 'GET',
            url,
            expiry: Date.now() + (expiry * 1000),
          };
          resolve(context);
        });
      } else { // write
        // we know this is only sent at the end of an exchange, where a presign is not needed
        if (data.md5) return resolve(context);
        // this allows us to add restrictions to a write, like the file size
        app.buckets.private.createPresignedPost({
          Fields: {
            key,
            'Content-Type': type,
            success_action_status: '200',
          },
          Conditions: [
            { 'key': key },
            ['content-length-range', 0, 104857600],
          ],
          Expires: expiry,
        }, (err, data) => {
          // fields are a set of fields that must be included with the file upload.
          context.result.presign = {
            method: 'POST',
            fields: data.fields,
            url: data.url,
            expiry: Date.now() + (expiry * 1000),
          };
          resolve(context);
        });
      }
    });
  };
};