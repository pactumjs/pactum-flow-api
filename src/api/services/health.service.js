const BaseService = require('./base.service');

class HealthService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  getResponse() {
    this.res.status(200).json({ message: 'OK' });
  }

}

module.exports = HealthService;