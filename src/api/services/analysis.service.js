const BaseService = require('./base.service');

class AnalysisService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getAnalysisByIdResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const doc = await this.$repo.analysis.getById(id);
      if (doc) {
        this.res.status(200).json(doc);
      } else {
        this.res.status(404).json({ message: 'Analysis not found' });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAnalysesResponse() {
    try {
      const doc = await this.$repo.analysis.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postAnalysisResponse() {
    try {
      const analysis = this.req.body;
      const project = await this.$repo.project.getById(analysis.projectId);
      if (project) {
        analysis.createdAt = new Date();
        const doc = await this.$repo.analysis.save(analysis);
        this.res.status(200).json(doc);
      } else {
        this.res.status(400).json({ error: 'Project not found'});
      }
    } catch (error) {
      if (error.toString().includes('duplicate key')) {
        this.handleError(new this.$error.ClientRequestError('Analysis already exists', 400));
      } else {
        this.handleError(error);
      }
    }
  }

  async deleteAnalysisResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const analysis = await this.$repo.analysis.getById(id);
      if (analysis) {
        await this.$repo.flow.deleteByAnalysisId(id);
        await this.$repo.interaction.deleteByAnalysisId(id);
        await this.$repo.exchange.deleteRequestByAnalysisId(id);
        await this.$repo.exchange.deleteResponseByAnalysisId(id);
        await this.$repo.metrics.deleteAnalysisMetrics(id);
        await this.$repo.environment.deleteAnalysis(analysis);
        await this.$repo.job.deleteJobById(id);
        const doc = await this.$repo.analysis.delete(id);
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