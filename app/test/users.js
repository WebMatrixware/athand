'use strict';

require('dotenv').config();

const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { after, afterEach, before, beforeEach, describe, it } = exports.lab = Lab.script();

const Crypto = require('crypto');
const MySQL = require('promise-mysql');
const Rewire = require('rewire');
const Sinon = require('sinon');

const Server = require('../server.js');
const UserUtils = require('../users.js');

let getUserOptions = function getUserOptions(options) {
  return Object.assign({
    method: 'GET',
    url: '/users/1'
  }, options);
};
let getUsersOptions = function getUsersOptions(options) {
  return Object.assign({
    method: 'GET',
    url: '/users'
  }, options);
};
let postUsersOptions = function postUsersOptions(options) {
  return Object.assign({
    method: 'POST',
    url: '/users',
    headers: {
      'content-type': 'application/json'
    },
    payload: JSON.stringify({
      login: 'blanning',
      email: 'blanning@all-mode.net',
      hash: '4cb9c8a8048fd02294477fcb1a41191a'
    })
  }, options);
};

let serv;

after( async () => {
  let pool = await MySQL.createPool({
    connectionLimit: 20,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });
  
  pool.query('DELETE FROM users WHERE users.user_email = "blanning@all-mode.net"')
});

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
    
    it('users list should ignire any request body payload sent with the request', { plan: 8 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject(getUsersOptions({
        payload: JSON.stringify({
          details: 'all'
        })
      }));
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
  
  describe('GET /users/{userID}', { only: false }, () => {
    
    it('user detail should return JSON formatted details of a specified user with a status code of 200', { plan: 10 }, async () => {
       
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject(getUserOptions());
      let obj = JSON.parse(response.payload);
      
      expect(response.statusCode).to.equal(200);
      expect(obj).to.be.an.object();
      expect(obj.id).to.exist();
      expect(obj.id).to.be.a.number();
      expect(obj.login).to.exist();
      expect(obj.login).to.be.a.string();
      expect(obj.email).to.exist();
      expect(obj.email).to.be.a.string();
      expect(obj.employee).to.exist();
      expect(obj.employee).to.be.a.string();
    });
    
    it('user detail should return 400 if letters are used in the userID param', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject(getUserOptions({
        url: '/users/b'
      }));
      
      expect(response.statusCode).to.equal(400);
    });
    
    it('user detail should return 400 if 0 is used as the userID param', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject(getUserOptions({
        url: '/users/0'
      }));
      
      expect(response.statusCode).to.equal(400);
    });
    
    it('user detail should return 400 if too large a number is used as the userID param', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject(getUserOptions({
        url: '/users/11111111111'
      }));
      
      expect(response.statusCode).to.equal(400);
    });
    
    it('user detail should return 404 if the specified userID cannot be found', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject(getUserOptions({
        url: '/users/999999999'
      }));
      
      expect(response.statusCode).to.equal(404);
    });
    
    it('user detail should return 500 if there is a problem with the mysql query or network transmission', { plan: 1 }, async() => {

      serv = await Server.Deployment({
        initialize: true,
        pool: { query: Sinon.stub().rejects() }
      });
      let response = await serv.inject(getUserOptions());

      expect(response.statusCode).to.equal(500);
    });
  });
  
  describe('POST /users', { only: false }, () => {
    
    it('create user should return 201 with link to new user', { plan: 3 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject(postUsersOptions());
      let obj = JSON.parse(response.payload);
      
      expect(response.statusCode).to.equal(201);
      expect(obj.status).to.equal('created');
      expect(obj.url).to.match(/http:\/\/0.0.0.0:8585\/users\/[0-9]+/g);
    });
    
    it('create user should return 400 when login is not provided in the payload on creation', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject({
        method: 'POST',
        url: '/users',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify({
          email: 'blanning@all-mode.net',
          hash: 'test123456'
        })
      });
      
      expect(response.statusCode).to.equal(400);
    });
    
    it('create user should return 400 when email is not provided in the payload on creation', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject({
        method: 'POST',
        url: '/users',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify({
          login: 'blanning',
          hash: 'test123456'
        })
      });
      
      expect(response.statusCode).to.equal(400);
    });
    
    it('create user should return 400 when email is not valid in the payload on creation', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject({
        method: 'POST',
        url: '/users',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify({
          login: 'blanning',
          email: 'blah@',
          hash: 'test123456'
        })
      });
      
      expect(response.statusCode).to.equal(400);
    });
    
    it('create user should return 400 when hash is not provided in the payload on creation', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject({
        method: 'POST',
        url: '/users',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify({
          login: 'blanning',
          email: 'blanning@all-mode.net'
        })
      });
      
      expect(response.statusCode).to.equal(400);
    });
    
    it('create user should return 400 when hash is not valid in the payload on creation', { plan: 1 }, async () => {
      
      serv = await Server.Deployment({ initialize: true });
      let response = await serv.inject({
        method: 'POST',
        url: '/users',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify({
          login: 'blanning',
          email: 'blanning@all-mode.net',
          hash: '123456'
        })
      });
      
      expect(response.statusCode).to.equal(400);
    });
    
    it('create user should return 500 if there is a problem with the mysql query or network transmission', { plan: 1 }, async () => {

      serv = await Server.Deployment({
        initialize: true,
        pool: { query: Sinon.stub().rejects() }
      });
      let response = await serv.inject(postUsersOptions());

      expect(response.statusCode).to.equal(500);
    });
  });
  
  describe('UsersUtils', { only: false }, () => {
    
    it('.generateHash(<text>) should return a salt (32 characters) and hash (128 characters) seperated by a colen (:)', { plan: 3 }, async () => {
      
      let hash = await UserUtils.generateHash('changeme');
      
      expect(hash).to.be.a.string();
      expect(hash).to.have.length(161);
      expect(hash[32]).to.equal(':');
    });
    
    it('.generateHash(<text>) should reject if there is a problem generating the hash', { plan: 1 }, async () => {
      
      let uu = Rewire('../users.js');
      let rb = Crypto.randomBytes;
      
      uu.__set__('Crypto', {
        randomBytes: rb,
        scrypt: (text, salt, value, callback) => {
          callback(new Error('custom error'));
        }
      });
      
      try {
        let hash = await uu.generateHash('changeme');
      } catch (err) {
        expect(err).to.exist();
      }
    });
    
    it('.verifyHash(<text>, <hash>) should return true when the provided text generates the provided hash given the salt attached to the hash', { plan: 1 }, async () => {
      
      let testHash = await UserUtils.generateHash('changeme');
      let result = await UserUtils.verifyHash('changeme', testHash);
      
      expect(result).to.be.true();
    });
    
    it('.verifyHash(<text>, <hash>) should return false when the provided text does not generate the provided hash given the salt attached to the hash', { plan: 1 }, async () => {
      
      let testHash = await UserUtils.generateHash('changeme');
      let result = await UserUtils.verifyHash('IWILLNOTCHANGE', testHash);
      
      expect(result).to.be.false();
    });
    
    it('.verifyHash(<text>) should reject if there is a problem generating the hash', { plan: 1 }, async () => {
      
      let testHash = await UserUtils.generateHash('changeme');
      
      let uu = Rewire('../users.js');
      // let rb = Crypto.randomBytes;
      
      uu.__set__('Crypto', {
        // randomBytes: rb,
        scrypt: (text, salt, value, callback) => {
          callback(new Error('custom error'));
        }
      });
      
      try {
        let hash = await uu.verifyHash('changeme', testHash);
      } catch (err) {
        expect(err).to.exist();
      }
    });
  });
});