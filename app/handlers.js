'use strict';

const MySQL = require('promise-mysql');
const SQL = require('./mysql.js');

exports.baseRoute = async function baseRoute(request, h) {
  return h.response('Test base route').code(200);
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