const BaseService = require('./base.service');

class ReleaseService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getReleaseResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      this.res.status(200).json(await this.$repo.release.get({ name: id }));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getReleasesResponse() {
    try {
      this.res.status(200).json(await this.$repo.release.get());
    } catch (error) {
      this.handleError(error);
    }
  }

  async postReleaseResponse() {
    try {
      const env = this.req.body;
      const project = await this.$repo.project.getById(env.projectId);
      if (project) {
        const analyses = await this.$repo.analysis.get({ projectId: env.projectId, version: env.version });
        if (analyses.length > 0) {
          const analysis = analyses[0];
          const doc = await this.$repo.release.save({
            environment: env.environment,
            projectId: env.projectId,
            analysisId: analysis._id,
            version: analysis.version
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

  async deleteReleaseResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      await this.$repo.relation.deleteByEnvironment(id);
      this.res.status(200).json(await this.$repo.release.delete(id));
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = ReleaseService;