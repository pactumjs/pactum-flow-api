const CompatibilityService = require('../services/compatibility.service');

function validateCompatibility(req, res) {
  new CompatibilityService(req, res).validateCompatibility();
}

function getCompatibilityResults(req, res) {
  new CompatibilityService(req, res).getCompatibilityResults();
}

function getCompatibilityResultsByProject(req, res) {
  new CompatibilityService(req, res).getCompatibilityResultsByProject();
}

function deleteCompatibilityResultsByProject(req, res) {
  new CompatibilityService(req, res).deleteCompatibilityResultsByProject();
}

function deleteCompatibilityResultsByProjectVersion(req, res) {
  new CompatibilityService(req, res).deleteCompatibilityResultsByProjectVersion();
}

function verifyCompatibility(req, res) {
  new CompatibilityService(req, res).verifyCompatibility();
}

module.exports = {
  validateCompatibility,
  getCompatibilityResults,
  getCompatibilityResultsByProject,
  deleteCompatibilityResultsByProject,
  deleteCompatibilityResultsByProjectVersion,
  verifyCompatibility
};