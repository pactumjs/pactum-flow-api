const HealthService = require('../services/health.service');

function getHealth(req, res) {
  new HealthService(req, res).getResponse();
}

module.exports = {
  getHealth
};