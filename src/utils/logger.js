const log = require('loglevel');

class Logger {

  constructor(id) {
    this.id = id;
    this.user = 'unauthorized_user';
  }

  info(...msg) {
    log.info('INFO', this.id, this.user, " - ", ...msg);
  }

  error(...msg) {
    log.error('ERROR', this.id, this.user, " - ", ...msg);
  }
  
}

module.exports = Logger;