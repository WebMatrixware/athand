'use strict';

const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { after, afterEach, before, beforeEach, describe, it } = exports.lab = Lab.script();

const Server = require('../server.js');

describe('General tests', () => {
  
  it('server should respont with 200 OK and test text message on GET request to defautl route', { plan: 1 }, async () => {
    
    let serv = await Server.Deployment({ initialize: true });
    let response = await serv.inject({
      method: 'GET',
      url: '/'
    });
    
    expect(response.statusCode).to.equal(200);
    
    await serv.stop();
  });
  
  it('server should have a non-null start time', { plan: 1 }, async () => {
    let serv = await Server.Deployment({ start: true });
    let info = serv.info;
    
    expect(info.started).to.not.be.null();
    
    await serv.stop();
  });
  
});