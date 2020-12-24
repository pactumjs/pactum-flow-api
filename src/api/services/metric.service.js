const BaseService = require('./base.service');
const MetricsRepository = require('../repository/metrics.repository');

class MetricService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getProjectMetricsResponse() {
    try {
      const metricsRepo = new MetricsRepository();
      const metrics = await metricsRepo.getProjectMetrics();
      this.res.status(200).json(metrics);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAnalysisMetricsResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const metricsRepo = new MetricsRepository();
      const metrics = await metricsRepo.getAnalysisMetricsById(id);
      this.res.status(200).json(metrics);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = MetricService;