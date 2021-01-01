const MetricService = require('../services/metric.service');

function getAnalysisMetrics(req, res) {
  new MetricService(req, res).getAnalysisMetricsResponse();
}

module.exports = {
  getAnalysisMetrics
};