const VerificationProcessor = require('../processors/verification.processor');
const BaseService = require('./base.service');

class VerificationService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async verify() {
    try {
      const { projectId } = this.req.body;
      const doc = await this.$repo.project.getById(projectId);
      if (!doc) {
        throw new this.$error.ClientRequestError('Project does not exist', 404);
      }
      const process = new VerificationProcessor(projectId, this.$repo);
      process.verify();
      this.res.status(202).json({ message: 'OK' });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getVerificationResults() {
    try {
      const consumerQuery = {
        consumer: this.req.query.projectId
      };
      if (this.req.query.version) consumerQuery.consumerVersion = this.req.query.version;
      const consumerResults = await this.$repo.contract.get(consumerQuery);
      const providerQuery = {
        provider: this.req.query.projectId
      };
      if (this.req.query.version) providerQuery.providerVersion = this.req.query.version;
      const providerResults = await this.$repo.contract.get(providerQuery);
      this.res.status(200).json(consumerResults.concat(providerResults));
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = VerificationService;