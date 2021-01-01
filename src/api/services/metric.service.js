const BaseService = require('./base.service');

class MetricService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getAnalysisMetricsResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const metrics = await this.$repo.metrics.getAnalysisMetricsById(id);
      this.res.status(200).json(metrics);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = MetricService;