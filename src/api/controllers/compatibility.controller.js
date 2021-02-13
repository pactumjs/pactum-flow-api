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

function deleteCompatibilityResultsByProjectVersion(req, res) {
  new CompatibilityService(req, res).deleteCompatibilityResultsByProjectVersion();
}

module.exports = {
  verifyCompatibility,
  getCompatibilityResults,
  deleteCompatibilityResultsByProject,
  deleteCompatibilityResultsByProjectVersion
};