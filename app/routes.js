'use strict';

const Handlers = require('./handlers.js');

module.exports = {
  register: async (server, options) => {
    server.route([{
      method: 'GET',
      path: '/',
      handler: Handlers.baseRoute,
      options: {
        description: 'Base test route',
        id: 'baseRoute',
        tags: ['test']
      }
    }, {
      method: 'GET',
      path: '/users',
      handler: Handlers.getUsersList,
      options: {
        description: 'Return a list of all users',
        id: 'getUserList',
        tags: ['get', 'users']
      }
    }]);
  },
  name: 'routes',
  version: '1.0.0'
};