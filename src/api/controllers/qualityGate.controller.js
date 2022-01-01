const QualityGateService = require('../services/qualityGate.service');

function getQualityGateStatus(req, res) {
  new QualityGateService(req, res).getQualityGateStatus();
}

function verifyQualityGateStatus(req, res) {
  new QualityGateService(req, res).verifyQualityGateStatus();
}

module.exports = {
  getQualityGateStatus,
  verifyQualityGateStatus
};