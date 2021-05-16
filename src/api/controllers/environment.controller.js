const EnvironmentService = require('../services/environment.service');

function getEnvironment(req, res) {
  new EnvironmentService(req, res).getEnvironmentResponse();
}

function getEnvironments(req, res) {
  new EnvironmentService(req, res).getEnvironmentsResponse();
}

function postEnvironment(req, res) {
  new EnvironmentService(req, res).postEnvironmentResponse();
}

function deleteEnvironment(req, res) {
  new EnvironmentService(req, res).deleteEnvironmentResponse();
}


module.exports = {
  getEnvironment,
  getEnvironments,
  postEnvironment,
  deleteEnvironment
};