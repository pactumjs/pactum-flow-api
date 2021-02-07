const config = require('../config');

function handler(req, _, __, cb) {
  const token = req.headers['x-auth-token'];
  if (!token) {
    cb(new Error('x-auth-token is missing in headers'));
    return;
  }
  if (token === config.auth.token) {
    cb();
  } else {
    cb(new Error('Unauthorized'));
  }
}

module.exports = handler;