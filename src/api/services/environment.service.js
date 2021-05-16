const BaseService = require('./base.service');

class EnvironmentService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getEnvironmentResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const doc = await this.$repo.environment.getById(id);
      if (!doc) {
        throw new this.$error.ClientRequestError('Environment does not exist', 404);
      }
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getEnvironmentsResponse() {
    try {
      const doc = await this.$repo.environment.get();
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postEnvironmentResponse() {
    try {
      const env = this.req.body;
      const project = await this.$repo.project.getById(env.projectId);
      if (project) {
        const analyses = await this.$repo.analysis.get({ projectId: env.projectId, version: env.version });
        if (analyses.length > 0) {
          const analysis = analyses[0];
          const doc = await this.$repo.environment.save({
            environment: env.environment,
            projectId: env.projectId,
            version: analysis._id
          });
          this.res.status(200).json(doc);
        } else {
          this.res.status(400).json({ error: 'Analysis not found'});
        }
      } else {
        this.res.status(400).json({ error: 'Project not found'});
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteEnvironmentResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const doc = await this.$repo.environment.getById(id);
      if (!doc) {
        throw new this.$error.ClientRequestError('Environment does not exist', 404);
      }
      const deleteDoc = await this.$repo.environment.delete(id);
      this.res.status(200).json(deleteDoc);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = EnvironmentService;