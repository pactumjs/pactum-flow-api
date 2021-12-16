const jwt = require('jsonwebtoken');
const config = require('../config');

function handler(req, _, __, cb) {
  const auth_token = req.headers['x-auth-token'];
  const session_token = req.headers['x-session-token'];
  if (auth_token) {
    if (auth_token === config.auth.token) {
      cb();
    } else {
      cb(new Error('Unauthorized'));
    }
  } else {
    if (!session_token) {
      cb(new Error('x-session-token is missing in headers'));
      return;
    }
    try {
      const jwt_payload = jwt.verify(session_token, config.auth.token);
      req.auth_user = jwt_payload.session;
      const allowed_roles = req.swagger.operation['x-role'] || [];
      if (!allowed_roles.includes(req.auth_user.role)) {
        cb(new Error('Forbidden'));
        return;
      }
      cb();
    } catch (error) {
      cb(new Error('Unauthorized'));
    }
  }
}

module.exports = handler;