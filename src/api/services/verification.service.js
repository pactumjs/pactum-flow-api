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

}

module.exports = VerificationService;