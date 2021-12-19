const jwt = require('jsonwebtoken');
const config = require('../config');

function handler(req, _, __, cb) {
  const auth_token = req.headers['x-auth-token'];
  const session_token = req.headers['x-session-token'];
  if (auth_token) {
    if (auth_token === config.auth.token) {
      req.log.user = 'admin_token';
      cb();
    } else {
      cb(new Error('Unauthorized'));
    }
    if (_.name === 'x-auth-token') req.log.info(req.method, req.path);
  } else {
    if (!session_token) {
      cb(new Error('x-session-token is missing in headers'));
    } else {
      try {
        const jwt_payload = jwt.verify(session_token, config.auth.token);
        req.auth_user = jwt_payload.session;
        req.log.user = req.auth_user.username;
        const allowed_roles = req.swagger.operation['x-role'] || [];
        if (!allowed_roles.includes(req.auth_user.role)) {
          cb(new Error('Forbidden'));
        } else {
          cb();
        }
      } catch (error) {
        cb(new Error('Unauthorized'));
      }
    }
    if (_.name === 'x-session-token') req.log.info(req.method, req.path);
  }
}

module.exports = handler;