const { v4 } = require('uuid');
const Logger = require('../utils/logger');

function middleware(req, res, next) {
  req.id = v4();
  req.log = new Logger(req.id);
  next()
}

module.exports = middleware;