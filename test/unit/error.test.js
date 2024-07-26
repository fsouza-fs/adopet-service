const { expect } = require('chai');

const { throwNewError } = require('../../src/utils/error');

describe('Error function', () => {
  it('should create a throw object', () => {
    const message = 'This is a test message';
    const status = 422;
    expect(throwNewError.bind(this, message, status)).to.throw(
      'This is a test message'
    );
  });
});
