const BaseService = require('./base.service');

class RelationService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getRelationsResponse() {
    const environments = await this.$repo.environment.get();
    if (environments.length === 0) {
      this.res.status(400).json({ message: 'Environments not found' });
      return;
    }
    const latest = environments[0];
    const projects = latest.projects;
    const relations = [];
    for (const project in projects) {
      const metrics = await this.$repo.metrics.getAnalysisMetricsById(projects[project]);
      relations.push({
        projectId: project,
        consumers: metrics.consumers.all,
        providers: metrics.providers.all
      });
    }
    this.res.status(200).json(relations);
  }

}

module.exports = RelationService;