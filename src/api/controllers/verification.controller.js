const VerificationService = require('../services/verification.service');

function verify(req, res) {
  new VerificationService(req, res).verify();
}

module.exports = {
  verify
};