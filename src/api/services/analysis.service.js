const BaseService = require('./base.service');
const ProjectRepository = require('../repository/project.repository');
const AnalysisRepository = require('../repository/analysis.repository');
const InteractionRepository = require('../repository/interaction.repository');
const FlowRepository = require('../repository/flow.repository');
const MetricsRepository = require('../repository/metrics.repository');

class AnalysisService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getAnalysisByIdResponse() {
    try {
      const analysisRepo = new AnalysisRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await analysisRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAnalysesResponse() {
    try {
      const analysisRepo = new AnalysisRepository();
      const doc = await analysisRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postAnalysisResponse() {
    try {
      const analysisRepo = new AnalysisRepository();
      const analysis = this.req.body;
      analysis.createdAt = new Date();
      const doc = await analysisRepo.save(analysis);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAnalysisResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const analysisRepo = new AnalysisRepository();
      const analysis = await analysisRepo.getById(id);
      if (analysis) {
        const flowRepo = new FlowRepository();
        await flowRepo.deleteByAnalysisId(id);
        const interactionRepo = new InteractionRepository();
        await interactionRepo.deleteByAnalysisId(id);
        // TODO: remove requests & responses
        const metricsRepo = new MetricsRepository();
        await metricsRepo.deleteAnalysisMetrics(id);
        // TODO: remove/update project metrics if this is the last analysis
        const projectRepo = new ProjectRepository();
        await projectRepo.deleteAnalysis(analysis.projectId, analysis);
        const doc = await analysisRepo.delete(id);
        this.res.status(200).json(doc);
      } else {
        this.res.status(404).json({ message: 'Analysis not found' });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = AnalysisService;