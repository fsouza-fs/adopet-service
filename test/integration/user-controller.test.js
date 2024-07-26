require('chai').should();

const Helper = require('../helpers/helpers');

const helper = new Helper();

describe('Auth Controller - login', () => {
  it('should return a login success', async () => {
    const email = 'admin@admin.com';
    const password = 'admin1';
    const { body } = await helper.apiServer
      .post('/admin/login')
      .send({ email, password })
      .set('Accept', 'application/json');

    body.should.have.property('message');
    body.message.should.equal('Success login in');
  });

  it('should return a failure when loggin in with the wrong email', async () => {
    const email = 'admin@admin.com';
    const password = 'admin';
    const { body } = await helper.apiServer
      .post('/admin/login')
      .send({ email, password })
      .set('Accept', 'application/json');

    body.should.have.property('message');
    body.message.should.equal(
      "Invalid value, email or password doesn't match any user in the website."
    );
  });

  it('should return a failure when loggin in with the wrong password', async () => {
    const email = 'admin@gmail.com';
    const password = 'admin1';
    const { body } = await helper.apiServer
      .post('/admin/login')
      .send({ email, password })
      .set('Accept', 'application/json');

    body.should.have.property('message');
    body.message.should.equal(
      "Invalid value, email or password doesn't match any user in the website."
    );
  });
});

describe('Auth Controller - Create user', () => {
  it('should return a failure when the email already exists', async () => {
    const name = 'admin';
    const email = 'admin@admin.com';
    const password = 'admin1';
    const { body } = await helper.apiServer
      .post('/admin/create-user')
      .send({ name, email, password })
      .set('Accept', 'application/json');

    body.should.have.property('message');
    body.message.should.equal('Invalid value. The email already exists.');
  });
});
