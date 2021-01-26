const VerificationService = require('../services/verification.service');

function verify(req, res) {
  new VerificationService(req, res).verify();
}

function getVerificationResults(req, res) {
  new VerificationService(req, res).getVerificationResults();
}

module.exports = {
  verify,
  getVerificationResults
};