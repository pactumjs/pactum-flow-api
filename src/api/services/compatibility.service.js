const CompatibilityProcessor = require('../processors/compatibility.processor.v2');
const BaseService = require('./base.service');

class CompatibilityService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async validateCompatibility() {
    try {
      const cp = new CompatibilityProcessor(this.$repo, this.req.log);
      cp.project_id = this.req.body.projectId;
      cp.project_version = this.req.body.version;
      await cp.run();
      this.res.status(200).json(cp.compatibility_results);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCompatibilityResults() {
    try {
      this.res.status(200).json(await this.$repo.compatibility.get(this.req.query));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCompatibilityResultsByProject() {
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

  async deleteCompatibilityResultsByProjectVersion() {
    const id = this.req.swagger.params.id.value;
    const version = this.req.swagger.params.version.value;
    const consumerQuery = {
      consumer: id,
      consumerVersion: version
    };
    const cDoc = await this.$repo.compatibility.delete(consumerQuery);
    const providerQuery = {
      provider: id,
      providerVersion: version
    };
    const pDoc = await this.$repo.compatibility.delete(providerQuery);
    this.res.status(200).json([cDoc, pDoc]);
  }

  async verifyCompatibility() {
    try {
      const cp = new CompatibilityProcessor(this.$repo, this.req.log);
      cp.project_id = this.req.body.projectId;
      cp.project_flows = this.req.body.flows || [];
      cp.project_interactions = this.req.body.interactions || [];
      cp.target_environment_names = this.req.body.environments || [];
      cp.save = false;
      await cp.run();

      this.res.status(200).json(cp.compatibility_results);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = CompatibilityService;