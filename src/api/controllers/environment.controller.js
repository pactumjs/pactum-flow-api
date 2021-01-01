const EnvironmentService = require('../services/environment.service');

function getEnvironments(req, res) {
  new EnvironmentService(req, res).getEnvironmentsResponse();
}

function postEnvironment(req, res) {
  new EnvironmentService(req, res).postEnvironmentResponse();
}


module.exports = {
  getEnvironments,
  postEnvironment
};