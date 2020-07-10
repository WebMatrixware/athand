'use strict';

const MySQL = require('promise-mysql');
const SQL = require('./mysql.js');
const UserUtils = require('./users.js');

exports.baseRoute = async function baseRoute(request, h) {
  
  return h.response('Test base route').code(200);
};

exports.createUser = async function createUser(request, h) {
  
  return UserUtils.generateHash(request.payload.hash).then((newHash) => {
  
    return request.pool.query(SQL.createUser, [request.payload.login, request.payload.email, newHash]).then((results, fields) => {

      return h.response(JSON.stringify({
        status: 'created',
        url: request.aka('getUserDetails', {
          params: { userID: results.insertId }
        }).toString()
      })).code(201);
    }).catch((err) => {
      return h.response(err.toString()).code(500);
    });
  }).catch((err) => {
    return h.response(err.toString()).code(500);
  });
};

exports.getUserDetails = async function getUserDetails(request, h) {

  let exists = null;
  
  await request.pool.query(SQL.checkForUser, [request.params.userID]).then((results, fields) => {
    
    exists = results[0].exists;
  }).catch((err) => {
    
    return h.response(err.toString()).code(500);
  });
  
  if (exists === 1) {
    return request.pool.query(SQL.getUserDetails, [request.params.userID]).then((results, fields) => {
      
      return h.response({
        
        id: results[0].id,
        login: results[0].login,
        email: results[0].email,
        employee: 'url will go here'
      }).code(200);
    }).catch((err) => {
      // This statement is hard to test because the test case in
      // which you make the mysql pool throw and error is caught
      // and handled in the initial test for existance, but I do
      // not want to remove this handler because in the real world
      // it is very possible to have the first test work, but then
      // the conneciton timeout or the server go offline before this
      // query hits.
      /* $lab:coverage:off$ */
      return h.response(err.toString()).code(500);
      /* $lab:coverage:on$ */
    });
  } else if (exists === 0) {
    return h.response(`userID of ${request.params.userID} not found`).code(404);
  } else {
    return h.response('internal server error').code(500);
  }
};

exports.getUsersList = async function getUsersList(request, h) {
  
  return request.pool.query(SQL.getUsersList).then((results, fields) => {
    
    let users = [];
    results.forEach((u) => {
      
      users.push({
        login: u.login,
        email: u.email,
        name: u.name
      });
    });
    
    return h.response(users).code(200);
  }).catch((err) => {
    
    return h.response(err.toString()).code(500);
  });
};