const { ClientRequestError } = require('../../utils/errors');
const ProjectRepository = require('../repository/project.repository');
const FlowRepository = require('../repository/flow.repository');
const AnalysisRepository = require('../repository/analysis.repository');
const InteractionRepository = require('../repository/interaction.repository');
const ExchangeRepository = require('../repository/exchange.repository');
const MetricsRepository = require('../repository/metrics.repository');
const EnvironmentRepository = require('../repository/environment.repository');
const CompatibilityRepository = require('../repository/compatibility.repository');
const JobRepository = require('../repository/job.repository');

class BaseService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.$repo = {
      project: new ProjectRepository(),
      analysis: new AnalysisRepository(),
      interaction: new InteractionRepository(),
      flow: new FlowRepository(),
      exchange: new ExchangeRepository(),
      metrics: new MetricsRepository(),
      environment: new EnvironmentRepository(),
      compatibility: new CompatibilityRepository(),
      job: new JobRepository()
    };
    this.$error = {
      ClientRequestError
    };
  }

  handleError(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      this.res.status(400).json({ error: 'Duplicate Record' });
    } else if (error instanceof ClientRequestError) {
      this.res.status(error.code).json({ error: error.message });
    } else {
      this.req.log.error(error);
      this.res.status(500).json({ error: "Internal Server Error" });
    }
  }

}

module.exports = BaseService;