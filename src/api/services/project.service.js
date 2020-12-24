const BaseService = require('./base.service');
const ProjectRepository = require('../repository/project.repository');
const AnalysisRepository = require('../repository/analysis.repository');
const InteractionRepository = require('../repository/interaction.repository');
const FlowRepository = require('../repository/flow.repository');
const MetricsRepository = require('../repository/metrics.repository');

class ProjectService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getProjectResponse() {
    try {
      const projectRepo = new ProjectRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await projectRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProjectsResponse() {
    try {
      const projectRepo = new ProjectRepository();
      const doc = await projectRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postProjectResponse() {
    try {
      const projectRepo = new ProjectRepository();
      const project = this.req.body;
      project._id = project.id;
      project.createdAt = new Date();
      const doc = await projectRepo.save(project);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteProjectResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const flowRepo = new FlowRepository();
      await flowRepo.deleteByProjectId(id);
      const interactionRepo = new InteractionRepository();
      await interactionRepo.deleteByProjectId(id);
      const analysisRepo = new AnalysisRepository();
      await analysisRepo.deleteByProjectId(id);
      const metricsRepo = new MetricsRepository();
      await metricsRepo.deleteProjectMetrics(id);
      await metricsRepo.deleteAnalysisMetricsByProjectId(id);
      const projectRepo = new ProjectRepository();
      const doc = await projectRepo.delete(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = ProjectService;