const AWS = require('aws-sdk');

module.exports = (app) => {
  AWS.config.update({
    signatureVersion: 'v4',
  });
  app.buckets = {
    public: new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: process.env.AWS_BUCKET_PUBLIC},
      signatureVersion: 'v4',
    }),
    private: new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: process.env.AWS_BUCKET_PRIVATE},
      signatureVersion: 'v4',
    }),
  };
};
