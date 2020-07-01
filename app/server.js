'use strict';

require('dotenv').config();

const Hapi = require('@hapi/hapi');
const MySQL = require('promise-mysql');

let GoodOptions = {}; 

/* $lab:coverage:off$ */
if(process.env.NODE_ENV === 'test') {
  GoodOptions = {
    ops: {
      interval: 1000
    },
    reporters: {
      consoleReporter: [{
        module: '@hapi/good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', error: '*' }]
      }, {
        module: '@hapi/good-console'
      }, 'stdout']
    }
  };
} else {
  GoodOptions = {
    ops: {
      interval: 1000
    },
    reporters: {
      consoleReporter: [{
        module: '@hapi/good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*', error: '*', request: '*' }]
      }, {
        module: '@hapi/good-console'
      }, 'stdout'],
      fileReporter: [{
        module: '@hapi/good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*', error: '*', request: '*' }]
      }, {
        module: '@hapi/good-squeeze',
        name: 'SafeJson',
        args: [
          null,
          { separator: ',' }
        ]
      }]
    }
  };
}
/* $lab:coverage:on$ */

exports.Deployment = async (opts) => {
  
  const Server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT
  });
  
  let Pool;

  /* $lab:coverage:off$ */
  if (typeof(opts.pool) !== 'undefined') {
    Pool = opts.pool;
  } else {
    Pool = await MySQL.createPool({
      connectionLimit: 20,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });
  }
  /* $lab:coverage:on$ */
  
  Server.decorate('request', 'pool', Pool);
  
  if (opts.start) {
    await Server.register([{
      plugin: require('@hapi/inert'),
      options: {}
    }, {
      plugin: require('./routes'),
      options: {}
    }, {
      plugin: require('hapi-scope'),
      options: {}
    }, {
      plugin: require('@hapi/vision'),
      options: {}
    }, {
      plugin: require('@hapi/good'),
      options: GoodOptions
    }, {
      plugin: require('akaya'),
      options: {}
    }]);
    
    await Server.start();
  }
  
  if (opts.initialize) {
    await Server.register([{
      plugin: require('@hapi/inert'),
      options: {}
    }, {
      plugin: require('./routes'),
      options: {}
    }, {
      plugin: require('@hapi/vision'),
      options: {}
    }, {
      plugin: require('@hapi/good'),
      options: GoodOptions
    }, {
      plugin: require('akaya'),
      options: {}
    }]);
    
    await Server.initialize();
  }
  
  return Server;
};

/* $lab:coverage:off$ */
process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});
/* $lab:coverage:on$ */