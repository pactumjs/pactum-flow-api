const MetricService = require('../services/metric.service');

function getProjectMetrics(req, res) {
  new MetricService(req, res).getProjectMetricsResponse();
}

function getAnalysisMetrics(req, res) {
  new MetricService(req, res).getAnalysisMetricsResponse();
}

module.exports = {
  getProjectMetrics,
  getAnalysisMetrics
};