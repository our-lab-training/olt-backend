const assert = require('assert');
const app = require('../../src/app');

describe('\'moduleConfig\' service', () => {
  it('registered the service', () => {
    const service = app.service('module-config');

    assert.ok(service, 'Registered the service');
  });
});
