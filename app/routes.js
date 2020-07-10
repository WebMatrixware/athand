'use strict';

const Handlers = require('./handlers.js');
const Joi = require('@hapi/joi');

const EmailSchema = Joi.string().email();
const HashSchema = Joi.string().length(32);
const IDSchema = Joi.number().min(1).max(9999999999).error(new Error('{userID} must be a number between 1 and 10 digits long'));
const StringSchema = Joi.string().min(1).max(120).error(new Error('string must be a non-empty string less than 120 characters long'));

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
        tags: ['get', 'users', 'list']
      }
    }, {
      method: 'POST',
      path: '/users',
      handler: Handlers.createUser,
      options: {
        description: 'Create a new user',
        id: 'createUser',
        tags: ['post', 'users', 'create'],
        validate: {
          payload: Joi.object({
            login: StringSchema.required(),
            email: EmailSchema.required(),
            hash: HashSchema.required()
          })
        }
      }
    }, {
      method: 'GET',
      path: '/users/{userID}',
      handler: Handlers.getUserDetails,
      options: {
        description: 'Return details of user by id',
        id: 'getUserDetails',
        tags: ['get', 'users', 'details'],
        validate: {
          params: Joi.object({
            userID: IDSchema
          })
        }
      }
    }]);
  },
  name: 'routes',
  version: '1.0.0'
};