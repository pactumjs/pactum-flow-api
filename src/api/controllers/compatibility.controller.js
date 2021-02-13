const CompatibilityService = require('../services/compatibility.service');

function verifyCompatibility(req, res) {
  new CompatibilityService(req, res).verifyCompatibility();
}

function getCompatibilityResults(req, res) {
  new CompatibilityService(req, res).getCompatibilityResults();
}

function deleteCompatibilityResultsByProject(req, res) {
  new CompatibilityService(req, res).deleteCompatibilityResultsByProject();
}

module.exports = {
  verifyCompatibility,
  getCompatibilityResults,
  deleteCompatibilityResultsByProject
};