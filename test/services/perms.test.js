const assert = require('assert');
const app = require('../../src/app');

describe('\'perms\' service', () => {
  it('registered the service', () => {
    const service = app.service('perms');

    assert.ok(service, 'Registered the service');
  });
});
