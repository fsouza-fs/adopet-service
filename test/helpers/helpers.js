const supertest = require('supertest');

const app = require('../../src/app');

class Helper {
  constructor() {
    this.apiServer = supertest(app);
  }
}

module.exports = Helper;
