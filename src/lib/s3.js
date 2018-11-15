const AWS = require('aws-sdk');

module.exports = (app) => {
  app.buckets = {
    public: new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: process.env.AWS_BUCKET_PUBLIC}
    }),
    private: new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: process.env.AWS_BUCKET_PRIVATE}
    }),
  };
};
