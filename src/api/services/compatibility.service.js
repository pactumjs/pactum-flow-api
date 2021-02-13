const CompatibilityProcessor = require('../processors/compatibility.processor');
const BaseService = require('./base.service');

class CompatibilityService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async verifyCompatibility() {
    try {
      const { projectId } = this.req.body;
      const doc = await this.$repo.project.getById(projectId);
      if (!doc) {
        throw new this.$error.ClientRequestError('Project does not exist', 404);
      }
      const processor = new CompatibilityProcessor(projectId, this.$repo);
      processor.verify();
      this.res.status(202).json({ message: 'OK' });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCompatibilityResults() {
    try {
      const consumerQuery = {
        consumer: this.req.query.projectId
      };
      if (this.req.query.version) consumerQuery.consumerVersion = this.req.query.version;
      const consumerResults = await this.$repo.compatibility.get(consumerQuery);
      const providerQuery = {
        provider: this.req.query.projectId
      };
      if (this.req.query.version) providerQuery.providerVersion = this.req.query.version;
      const providerResults = await this.$repo.compatibility.get(providerQuery);
      this.res.status(200).json(consumerResults.concat(providerResults));
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteCompatibilityResultsByProject() {
    const id = this.req.swagger.params.id.value;
    const consumerQuery = {
      consumer: id
    };
    const cDoc = await this.$repo.compatibility.delete(consumerQuery);
    const providerQuery = {
      provider: id
    };
    const pDoc = await this.$repo.compatibility.delete(providerQuery);
    this.res.status(200).json([cDoc, pDoc]);
  }

}

module.exports = CompatibilityService;