const { utils } = require('pactum-matchers');

class CompatibilityProcessor {

  constructor(project, repo) {
    this.project = project;
    this.$repo = repo;
    this.environments = [];
    this.projects = [];
    this.flowDocs = [];
    this.interactions = null;
    this.flows = null;
    this.analyses = [];
    this.metrics = [];
    this.save = true;
    this.results = [];
    this.targetEnvironments = null;
  }

  async init() {
    this.environments = await this.$repo.environment.get();
    if (this.targetEnvironments) {
      this.environments = this.environments.filter(env => this.targetEnvironments.includes(env._id.toString()));
    }
    this.projects = (await this.$repo.project.get()).map(project => project._id.toString());
  }

  async getAnalysis(id) {
    let analysis = this.analyses.find(_analysis => _analysis._id.equals(id));
    if (!analysis) {
      analysis = await this.$repo.analysis.getById(id);
      if (analysis) {
        this.analyses.push(analysis);
      }
    }
    return analysis;
  }

  async getMetrics(id) {
    let metric = this.metrics.find(_metric => _metric._id.equals(id));
    if (!metric) {
      metric = await this.$repo.metrics.getAnalysisMetricsById(id);
      if (metric) {
        this.metrics.push(metric);
      }
    }
    return metric;
  }

  async verify() {
    try {
      await this.init();
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
        console.log(`Provider Verification | Project not found in environment - '${environment._id}'`);
        continue;
      }
      const analysis = await this.getAnalysis(analysisId);
      const interactions = await this.getInteractionDocs(analysisId);
      const metrics = await this.getMetrics(analysisId);
      const providers = metrics.providers.all;
      for (let j = 0; j < providers.length; j++) {
        const provider = providers[j];
        const exceptions = [];
        if (!this.projects.includes(provider)) {
          console.log(`Provider Verification | Provider - '${provider}' does not exist`);
          // TODO: provider does not exist
          continue;
        }
        const providerAnalysisId = environment.projects[provider];
        if (!providerAnalysisId) {
          console.log(`Provider Verification | Provider - '${provider}' does not exist in '${environment._id}' environment`);
          // TODO: provider does not exist in this environment
          continue;
        }
        const providerInteractions = interactions.filter(interaction => interaction.provider === provider);
        for (let k = 0; k < providerInteractions.length; k++) {
          const providerInteraction = providerInteractions[k];
          const { flow } = providerInteraction;
          const flowDoc = await this.getFlow(flow, providerAnalysisId, true);
          if (!flowDoc) {
            console.log(`Provider Verification | Flow - '${flow}' does not exist in provider - '${provider}'`);
            exceptions.push({ flow, error: 'Flow Not Found' });
            continue;
          }
          const expectedReq = providerInteraction.request;
          const reqError = this.compareRequest(flowDoc.request, expectedReq);
          if (reqError) {
            console.log(`Provider Verification | Request match failed for flow - '${flow}' & provider - '${provider}' with error - '${reqError}'`);
            exceptions.push({ flow, error: reqError });
            continue;
          }
          const expectedResponse = providerInteraction.response;
          const resError = this.compareResponse(flowDoc.response, expectedResponse);
          if (resError) {
            console.log(`Provider Verification | Request match failed for flow - '${flow}' & provider - '${provider}' with error - '${resError}'`);
            exceptions.push({ flow, error: resError });
            continue;
          }
        }
        const providerAnalysis = await this.$repo.analysis.getById(providerAnalysisId);
        const compatibility = {
          consumer: this.project,
          consumerVersion: analysis.version,
          provider,
          providerVersion: providerAnalysis.version,
          status: exceptions.length > 0 ? 'FAILED' : 'PASSED',
          exceptions,
          verifiedAt: new Date()
        };
        if (this.save) {
          await this.$repo.compatibility.save(compatibility);
        } else {
          this.results.push(compatibility);
        }
      }
    }
  }

  async consumerVerification() {
    for (let i = 0; i < this.environments.length; i++) {
      const environment = this.environments[i];
      const analysisId = environment.projects[this.project];
      if (!analysisId) {
        console.log(`Consumer Verification | Project not found in environment - ${environment._id}`);
        continue;
      }
      const analysis = await this.getAnalysis(analysisId);
      const metrics = await this.getMetrics(analysisId);
      const consumers = metrics.consumers.all;
      for (let j = 0; j < consumers.length; j++) {
        const consumerId = consumers[j];
        const consumerAnalysisId = environment.projects[consumerId];
        const exceptions = [];
        if (!consumerAnalysisId) {
          console.log(`Consumer Verification | Consumer - '${consumerId}' not found in environment - '${environment._id}'`);
          continue;
        }
        const interactions = await this.$repo.interaction.get({ analysisId: consumerAnalysisId });
        let count = 0;
        for (let k = 0; k < interactions.length; k++) {
          const { _id, provider, flow } = interactions[k];
          if (provider !== this.project) {
            continue;
          }
          count++;
          const flowDoc = await this.getFlow(flow, analysisId);
          if (!flowDoc) {
            console.log(`Consumer Verification | Flow - '${flow}' does not exist in project - '${this.project}'`);
            continue;
          }
          const interactionRequest = await this.$repo.exchange.getRequestById(_id);
          const interactionResponse = await this.$repo.exchange.getResponseById(_id);
          const reqError = this.compareRequest(flowDoc.request, interactionRequest);
          if (reqError) {
            console.log(`Consumer Verification | Request match failed. | Project: '${this.project}' | Flow - '${flow}' | Consumer - '${consumerId}' | Error - '${reqError}'`);
            exceptions.push({ flow, error: reqError });
            continue;
          }
          const resError = this.compareResponse(flowDoc.response, interactionResponse);
          if (resError) {
            console.log(`Consumer Verification | Response match failed. | Project: '${this.project}' | Flow - '${flow}' | Consumer - '${consumerId}' | Error - '${reqError}'`);
            exceptions.push({ flow, error: resError });
            continue;
          }
        }
        const consumerAnalysis = await this.$repo.analysis.getById(consumerAnalysisId);
        if (count > 0) {
          const compatibility = {
            consumer: consumerId,
            consumerVersion: consumerAnalysis.version,
            provider: this.project,
            providerVersion: analysis.version,
            status: exceptions.length > 0 ? 'FAILED' : 'PASSED',
            exceptions: exceptions,
            verifiedAt: new Date()
          };
          if (this.save) {
            await this.$repo.compatibility.save(compatibility);
          } else {
            this.results.push(compatibility);
          }
        } else {
          console.log(`Consumer Verification | No interactions matched with current provider. | Consumer: '${consumerId}' | Project: '${this.project}'`);
        }
      }
    }
  }

  async getFlow(name, analysisId, fromDB = false) {
    if (this.flows && fromDB === false) {
      return this.flows.find(flow => flow.name === name);
    } else {
      let flowDoc = this.flowDocs.find(flowDoc => flowDoc.name === name && flowDoc.analysisId.equals(analysisId));
      if (!flowDoc) {
        const flowDocs = await this.$repo.flow.get({
          name,
          analysisId
        });
        if (!flowDocs || flowDocs.length === 0) {
          return null;
        }
        flowDoc = flowDocs[0];
        flowDoc.request = await this.$repo.exchange.getRequestById(flowDoc._id);
        flowDoc.response = await this.$repo.exchange.getResponseById(flowDoc._id);
        return flowDoc;
      }
      return flowDoc;
    }
  }

  async getInteractionDocs(analysisId) {
    if (this.interactions) {
      return this.interactions;
    }
    const interactions = await this.$repo.interaction.get({ analysisId });
    for (let i = 0; i < interactions.length; i++) {
      const interaction = interactions[i];
      interaction.request = await this.$repo.exchange.getRequestById(interaction._id);
      interaction.response = await this.$repo.exchange.getResponseById(interaction._id);
    }
    return interactions;
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
    if (expected.queryParams && typeof actual.queryParams === 'undefined') {
      return `Failed to match request - Query Params Not Found`;
    } else {
      const queryParamsResult = utils.compare(actual.queryParams, expected.queryParams, rules, '$.query', true);
      if (!queryParamsResult.equal) {
        return `Failed to match request query params - ${queryParamsResult.message}`;
      }
    }
    if (typeof expected.headers !== 'undefined') {
      const headersResult = utils.compare(actual.headers, expected.headers, rules, '$.headers', false);
      if (!headersResult.equal) {
        return `Failed to match request headers - ${headersResult.message}`;
      }
    }
    if (expected.body && typeof actual.body === 'undefined') {
      return `Failed to match request - Body Not Found`;
    } else {
      const bodyResult = utils.compare(actual.body, expected.body, rules, '$.body', true);
      if (!bodyResult.equal) {
        return `Failed to match request body - ${bodyResult.message}`;
      }
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
      if (typeof actual.body === 'undefined') {
        return `Failed to match response - Body Not Found`;
      } else {
        const bodyResult = utils.compare(actual.body, expected.body, rules, '$.body', false);
        if (!bodyResult.equal) {
          return `Failed to match response body - ${bodyResult.message}`;
        }
      }
    }
  }

}

module.exports = CompatibilityProcessor;