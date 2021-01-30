const { utils } = require('pactum-matchers');

class CompatibilityProcessor {

  constructor(project, repo) {
    this.project = project;
    this.$repo = repo;
    this.environments = [];
    this.projects = [];
  }

  async verify() {
    try {
      this.environments = await this.$repo.environment.get();
      this.projects = (await this.$repo.project.get()).map(project => project._id.toString());
      await this.providerVerification();
      await this.consumerVerification();
    } catch (error) {
      console.log(error);
    }
  }

  async providerVerification() {
    for (let i = 0; i < this.environments.length; i++) {
      const environment = this.environments[i];
      const analysisId = environment.projects[this.project];
      if (!analysisId) {
        console.log(`Project not found in environment - ${environment._id}`);
        continue;
      }
      const analysis = await this.$repo.analysis.getById(analysisId);
      const providers = {};
      const interactions = await this.$repo.interaction.get({ analysisId });
      for (let j = 0; j < interactions.length; j++) {
        const { _id, provider, flow } = interactions[j];
        if (!this.projects.includes(provider)) {
          console.log(`Provider - '${provider}' does not exist`);
          // TODO: provider does not exist
          continue;
        }
        const providerAnalysisId = environment.projects[provider];
        if (!providerAnalysisId) {
          console.log(`Provider - '${provider}' does not exist in '${environment}' environment`);
          // TODO: provider does not exist in this environment
          continue;
        }
        if (!providers[`${provider}`]) {
          providers[`${provider}`] = { exceptions: [] };
          providers[`${provider}`]['analysis'] = await this.$repo.analysis.getById(providerAnalysisId);
        }
        const flowDocs = await this.$repo.flow.get({ name: flow, analysisId: providerAnalysisId });
        if (flowDocs.length === 0) {
          console.log(`Flow - '${flow}' does not exist in provider - '${provider}'`);
          providers[`${provider}`].exceptions.push({ flow, error: 'flow does not exist' });
          continue;
        }
        const flowDoc = flowDocs[0];
        const expectedReq = await this.$repo.exchange.getRequestById(_id);
        const actualReq = await this.$repo.exchange.getRequestById(flowDoc._id);
        const reqError = this.compareRequest(actualReq, expectedReq);
        if (reqError) {
          console.log(`Request match failed for flow - '${flow}' & provider - '${provider}' with error - '${reqError}'`);
          providers[`${provider}`].exceptions.push({ flow, error: reqError });
          continue;
        }
        const expectedResponse = await this.$repo.exchange.getResponseById(_id);
        const actualResponse = await this.$repo.exchange.getResponseById(flowDoc._id);
        const resError = this.compareResponse(actualResponse, expectedResponse);
        if (resError) {
          console.log(`Request match failed for flow - '${flow}' & provider - '${provider}' with error - '${resError}'`);
          providers[`${provider}`].exceptions.push({ flow, error: resError });
          continue;
        }
      }
      const providerList = Object.keys(providers);
      for (let j = 0; j < providerList.length; j++) {
        const provider = providers[providerList[j]];
        const contract = {
          consumer: this.project,
          consumerVersion: analysis.version,
          provider: providerList[j],
          providerVersion: provider.analysis.version,
          status: provider.exceptions.length > 0 ? 'FAILED' : 'PASSED',
          exceptions: provider.exceptions
        };
        await this.$repo.compatibility.save(contract);
      }
    }
  }

  async consumerVerification() {
    // for (let i = 0; i < this.environments.length; i++) {
    //   const environment = this.environments[i];
    //   const analysisId = environment.projects[this.project];
    //   if (!analysisId) {
    //     console.log(`Project not found in environment - ${environment._id}`);
    //     continue;
    //   }
    //   const flows = await this.$repo.flow.get({ analysisId });
    //   if (flows.length === 0) {
    //     console.log(`Project does not have flows in environment - ${environment._id}`);
    //     continue;
    //   }
    //   const projects = Object.keys(environment.projects);
    //   for (let j = 0; j < projects.length; j++) {
    //     const consumer = projects[j];
    //     if (consumer === this.project) {
    //       continue;
    //     }
    //     const consumerAnalysisId = environment.projects[consumer];
    //     const consumerAnalysis = await this.$repo.analysis.getById(consumerAnalysisId);
    //     if (consumerAnalysis.providers === 0) {
    //       continue;
    //     }
    //     const consumerAnalysisMetrics = await this.$repo.metrics.getAnalysisMetricsById(consumerAnalysisId);
    //     if (consumerAnalysisMetrics.providers.all.includes(this.project)) {
    //       const interactions = await this.$repo.interaction.get({ analysisId: consumerAnalysisId });
    //       const consumers = {};
    //       for (let k = 0; k < interactions.length; k++) {
    //         const { _id, provider, flow } = interactions[k];
    //         if (provider !== this.project) {
    //           continue;
    //         }
    //         if (!consumers[`${consumer}`]) {
    //           consumers[`${consumer}`] = { exceptions: [] };
    //           consumers[`${consumer}`]['analysis'] = consumerAnalysis;
    //         }
    //         const flowDocs = await this.$repo.flow.get({ name: flow, analysisId });
    //         if (flowDocs.length === 0) {
    //           console.log(`Flow - '${flow}' does not exist in provider - '${provider}'`);
    //           consumers[`${consumer}`].exceptions.push({ flow, error: 'flow does not exist' });
    //           continue;
    //         }
    //         const flowDoc = flowDocs[0];
    //       }
    //     }
    //   }

    // }
  }

  compareRequest(actual, expected) {
    const rules = expected.matchingRules || {};
    if (actual.method !== expected.method) {
      return 'Failed to match request method';
    }
    if (actual.path !== expected.path) {
      return 'Failed to match request path';
    }
    const pathParamsResult = utils.compare(actual.pathParams, expected.pathParams, rules, '$.path', true);
    if (!pathParamsResult.equal) {
      return `Failed to match request path params - ${pathParamsResult.message}`;
    }
    const queryParamsResult = utils.compare(actual.queryParams, expected.queryParams, rules, '$.query', true);
    if (!queryParamsResult.equal) {
      return `Failed to match request query params - ${queryParamsResult.message}`;
    }
    if (typeof expected.headers !== 'undefined') {
      const headersResult = utils.compare(actual.headers, expected.headers, rules, '$.headers', false);
      if (!headersResult.equal) {
        return `Failed to match request headers - ${headersResult.message}`;
      }
    }
    const bodyResult = utils.compare(actual.body, expected.body, rules, '$.body', true);
    if (!bodyResult.equal) {
      return `Failed to match request body - ${bodyResult.message}`;
    }
  }

  compareResponse(actual, expected) {
    const rules = expected.matchingRules || {};
    if (actual.statusCode !== expected.statusCode) {
      return 'Failed to match response status code';
    }
    if (typeof expected.headers !== 'undefined') {
      const headersResult = utils.compare(actual.headers, expected.headers, rules, '$.headers', false);
      if (!headersResult.equal) {
        return `Failed to match response headers - ${headersResult.message}`;
      }
    }
    if (typeof expected.body !== 'undefined') {
      const bodyResult = utils.compare(actual.body, expected.body, rules, '$.body', false);
      if (!bodyResult.equal) {
        return `Failed to match response body - ${bodyResult.message}`;
      }
    }
  }

}

module.exports = CompatibilityProcessor;