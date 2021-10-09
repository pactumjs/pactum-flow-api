const CompatibilityService = require('../services/compatibility.service');

function verifyCompatibility(req, res) {
  new CompatibilityService(req, res).verifyCompatibility();
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

function validateCompatibilityOfFlowsAndInteractions(req, res) {
  new CompatibilityService(req, res).validateCompatibilityOfFlowsAndInteractions();
}

module.exports = {
  verifyCompatibility,
  getCompatibilityResults,
  getCompatibilityResultsByProject,
  deleteCompatibilityResultsByProject,
  deleteCompatibilityResultsByProjectVersion,
  validateCompatibilityOfFlowsAndInteractions
};