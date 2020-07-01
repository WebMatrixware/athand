'use strict';

const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { after, afterEach, before, beforeEach, describe, it } = exports.lab = Lab.script();
const Sinon = require('sinon');

const Server = require('../server.js');

let getUsersOptions = function getUsersOptions(options) {
  return Object.assign({
    method: 'GET',
    url: '/users'
  }, options);
};

let serv;

describe('users module', { only: false }, () => {
  
  describe('GET /users', { only: false }, () => {
    
    it('users list should return a JSON list of all users in system', { plan: 8 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject(getUsersOptions());
      let obj = JSON.parse(response.payload);
      
      expect(response.statusCode).to.equal(200);
      expect(obj).to.be.an.array();
      expect(obj[0].name).to.exist();
      expect(obj[0].name).to.be.a.string();
      expect(obj[0].email).to.exist();
      expect(obj[0].email).to.be.a.string();
      expect(obj[0].login).to.exist();
      expect(obj[0].login).to.be.a.string();
    });
    
    it('users list should return 500 internal server error if there is a problem with the mysql query or network transmission', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({
        initialize: true,
        pool: { query: Sinon.stub().rejects() }
      });
      let response = await serv.inject(getUsersOptions());
      
      expect(response.statusCode).to.equal(500);
    });
  });
});