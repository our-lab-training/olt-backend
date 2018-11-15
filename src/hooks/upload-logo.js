// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const uuidv4 = require('uuid/v4');
const errors = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const { data, app } = context;
    const { logo } = data;
    if(!logo) return context;
    if(logo.indexOf('data:image/png;base64,') !== 0) throw new errors.BadRequest('Invalid logo image format provided.');
    const logoBuf = new Buffer(logo.replace(/^data:image\/\w+;base64,/, ''),'base64');
    const key = `logos/${uuidv4()}.png`;

    const req = {
      ACL: 'public-read',
      Key: key, 
      Body: logoBuf,
      ContentEncoding: 'base64',
      ContentType: 'image/png'
    };

    try {
      await app.buckets.public.putObject(req).promise();
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      throw new errors.GeneralError('Failed to upload image, please contact an administrator.');
    }

    context.data.logo = `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_PUBLIC}/${key}`;

    return context;
  };
};
