const BaseService = require('./base.service');

class RelationService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getRelationsResponse() {
    const relations = [];
    const project_environments = await this.$repo.release.get({ name: 'latest' });
    for (let i = 0; i < project_environments.length; i++) {
      const metrics = await this.$repo.metrics.getAnalysisMetricsById(project_environments[i].analysisId);
      relations.push({
        projectId: project_environments[i].projectId,
        consumers: metrics.consumers.all,
        providers: metrics.providers.all
      });
    }
    this.res.status(200).json(relations);
  }

}

module.exports = RelationService;