const CompatibilityService = require('../services/compatibility.service');

function verifyCompatibility(req, res) {
  new CompatibilityService(req, res).verifyCompatibility();
}

function getCompatibilityResults(req, res) {
  new CompatibilityService(req, res).getCompatibilityResults();
}

module.exports = {
  verifyCompatibility,
  getCompatibilityResults
};