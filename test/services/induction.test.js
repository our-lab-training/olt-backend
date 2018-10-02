const assert = require('assert');
const app = require('../../src/app');

describe('\'induction\' service', () => {
  it('registered the service', () => {
    const service = app.service('induction');

    assert.ok(service, 'Registered the service');
  });
});
