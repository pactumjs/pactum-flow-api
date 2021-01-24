const BaseService = require('./base.service');

class ContractVerification {

  constructor(project, repo) {
    this.project = project;
    this.$repo = repo;
    this.environments = [];
    this.projects = [];
  }

  async verify() {
    try {
      this.environments = await this.$repo.environment.get();
      this.projects = await this.$repo.project.get();
      await this.providerVerification();
      await this.consumerVerification();
    } catch (error) {
      console.log(error);
    }
  }

  async providerVerification() {
    for (let i = 0; i < this.environments.length; i++) {
      const environment = this.environments[i].toObject();
      const analysis = environment.projects[this.project];
      if (!analysis) {
        console.log(`Project not found in environment - ${environment._id}`);
        continue;
      }
      const interactions = await this.$repo.interaction.get({ analysisId: analysis });
      for (let j = 0; j < interactions.length; j++) {
        const { _id, provider, flow } = interactions[j];
        if (!this.projects.includes(provider)) {
          console.log(`Provider - '${provider}' does not exist`);
          // TODO: provider does not exist
          continue;
        }
        const providerAnalysis = environment.projects[provider];
        if (!providerAnalysis) {
          console.log(`Provider - '${provider}' does not exist in '${environment}' environment`);
          // TODO: provider does not exist in this environment
          continue;
        }
        const flowDoc = await this.$repo.flow.get({ name: flow, analysisId: providerAnalysis._id });
        if (!flowDoc) {
          console.log(`Flow - '${flow}' does not exist in provider - '${provider}'`);
          // TODO: flow does not exist
          continue;
        }
        const expectedReq = await this.$repo.exchange.getRequestById(_id);
        const actualReq = await this.$repo.exchange.getRequestById(flowDoc._id);
        // TODO: compare requests
        const expectedResponse = await this.$repo.exchange.getResponseById(_id);
        const actualResponse = await this.$repo.exchange.getResponseById(flowDoc._id);
        // TODO: compare responses
      }
    }
  }

  async consumerVerification() {

  }

}

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
      
      const verifier = new ContractVerification(projectId, this.$repo);
      verifier.verify();
      this.res.status(202).json({ message: 'OK' });
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = VerificationService;