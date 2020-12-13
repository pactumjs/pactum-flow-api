const MetricService = require('../services/metric.service');

function getProjectMetrics(req, res) {
  new MetricService(req, res).getProjectMetricsResponse();
}

module.exports = {
  getProjectMetrics
};