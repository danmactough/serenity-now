'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const supertest = require('supertest');
const createServer = require('../server').createServer;
const assert = require('assert');

describe('serenity now', function () {
  let server;

  before('start server', function (done) {
    server = createServer({
      port: 0
    });
    server.once('listening', done);
  });

  after('stop server', function () {
    server.close();
  });

  it('should respond ok on the "/ok" route', function () {
    return supertest(server)
      .get('/ok')
      .send()
      .expect(200)
      .then(res => {
        assert.deepEqual(res.body, { message: 'ok' });
      });
  });

  it('should respond with a Simple Error on the "/simple-error" route', function () {
    return supertest(server)
      .get('/simple-error')
      .send()
      .expect(400)
      .then(res => {
        assert.deepEqual(res.body, {
          code: 'BadRequestError',
          message: 'Simple Error'
        });
      });
  });

  it('should response with a 500 error on the "/throws" route', function () {
    return supertest(server)
      .get('/throws')
      .send()
      .expect(500)
      .then(res => {
        assert.deepEqual(res.body, {
          code: 'InternalServerError',
          message: 'Internal Server Error'
        });
      });
  });

  it('should response with a 500 error on the "/throws-with-promise" route', function () {
    return supertest(server)
      .get('/throws-with-promise')
      .send()
      .expect(500)
      .then(res => {
        assert.deepEqual(res.body, {
          code: 'InternalServerError',
          message: 'Internal Server Error'
        });
      });
  });
});
