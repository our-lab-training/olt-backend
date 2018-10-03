const assert = require('assert');
const app = require('../../src/app');

describe('\'moduleConfigs\' service', () => {
  it('registered the service', () => {
    const service = app.service('module-configs');

    assert.ok(service, 'Registered the service');
  });
});
