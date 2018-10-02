const assert = require('assert');
const app = require('../../src/app');

describe('\'quizzes\' service', () => {
  it('registered the service', () => {
    const service = app.service('quizzes');

    assert.ok(service, 'Registered the service');
  });
});
