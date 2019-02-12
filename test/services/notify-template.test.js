const assert = require('assert');
const app = require('../../src/app');

describe('\'notify-template\' service', () => {
  it('registered the service', () => {
    const service = app.service('notify-template');

    assert.ok(service, 'Registered the service');
  });
});
