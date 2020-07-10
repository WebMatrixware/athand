'use strict';

const Crypto = require('crypto');

exports.generateHash = async (text) => {

  return new Promise((resolve, reject) => {
    
    let salt = Crypto.randomBytes(16).toString('hex');
    
    Crypto.scrypt(text, salt, 64, (err, hash) => {
      
      if (err) {
        reject(err);
      } else {
        resolve(`${salt}:${hash.toString('hex')}`);
      }
    });
  });
};

exports.verifyHash = async (text, hash) => {
  
  return new Promise((resolve, reject) => {
    
    const [salt, key] = hash.split(':');
    Crypto.scrypt(text, salt, 64, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(key === hash.toString('hex'));
      }
    });
  });
};