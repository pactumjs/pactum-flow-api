const QualityGateService = require('../services/qualityGate.service');

function getQualityGateStatus(req, res) {
  new QualityGateService(req, res).getQualityGateStatus();
}

module.exports = {
  getQualityGateStatus
};