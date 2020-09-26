/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const logger = require('./logger');
const app = require('./app');
const port = process.env.PORT || app.get('port');
const host = process.env.HOST || app.get('host');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) => {
  if (reason.name === 'MongoNetworkError') return console.error('Error: mongo connection failed.');
  console.error('Unhandled Rejection at: Promise ', p, reason);
});

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', host, port)
);
