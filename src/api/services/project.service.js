const BaseService = require('./base.service');
const { ClientRequestError } = require('../../utils/errors');

class ProjectService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getProjectResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const doc = await this.$repo.project.getById(id);
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
      const doc = await this.$repo.project.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postProjectResponse() {
    try {
      const project = this.req.body;
      project._id = project.id;
      project.createdAt = new Date();
      const doc = await this.$repo.project.save(project);
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
      const _doc = await this.$repo.project.getById(id);
      if (!_doc) {
        throw new ClientRequestError('Project does not exist', 404);
      }
      await this.$repo.flow.deleteByProjectId(id);
      await this.$repo.interaction.deleteByProjectId(id);
      await this.$repo.exchange.deleteRequestByProjectId(id);
      await this.$repo.exchange.deleteResponseByProjectId(id);
      await this.$repo.analysis.deleteByProjectId(id);
      await this.$repo.metrics.deleteAnalysisMetricsByProjectId(id);
      const doc = await this.$repo.project.delete(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = ProjectService;