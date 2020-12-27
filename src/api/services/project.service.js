const BaseService = require('./base.service');
const ProjectRepository = require('../repository/project.repository');
const AnalysisRepository = require('../repository/analysis.repository');
const InteractionRepository = require('../repository/interaction.repository');
const FlowRepository = require('../repository/flow.repository');
const MetricsRepository = require('../repository/metrics.repository');

// TODO: move repo to base service

const { ClientRequestError } = require('../../utils/errors');

class ProjectService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getProjectResponse() {
    try {
      const projectRepo = new ProjectRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await projectRepo.getById(id);
      if (!doc) {
        throw new ClientRequestError('Project does not exist', 404);
      }
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
      if (error.toString().includes('duplicate key')) {
        this.handleError(new ClientRequestError('Project already exists', 400));
      } else {
        this.handleError(error);
      }
    }
  }

  async deleteProjectResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const projectRepo = new ProjectRepository();
      const _doc = await projectRepo.getById(id);
      if (!_doc) {
        throw new ClientRequestError('Project does not exist', 404);
      }
      const flowRepo = new FlowRepository();
      await flowRepo.deleteByProjectId(id);
      const interactionRepo = new InteractionRepository();
      await interactionRepo.deleteByProjectId(id);
      // TODO: remove requests & responses
      const analysisRepo = new AnalysisRepository();
      await analysisRepo.deleteByProjectId(id);
      const metricsRepo = new MetricsRepository();
      await metricsRepo.deleteProjectMetrics(id);
      await metricsRepo.deleteAnalysisMetricsByProjectId(id);
      const doc = await projectRepo.delete(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = ProjectService;