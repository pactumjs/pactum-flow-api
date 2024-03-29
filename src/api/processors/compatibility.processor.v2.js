const { utils } = require('pactum-matchers');

class CompatibilityProcessor {

  constructor(repo, log) {
    this.$repo = repo;
    this.log = log;

    this.project_id = null;
    this.project_version = null;
    this.project_analysis = null;
    this.project_metric = null;
    this.project_flows = [];
    this.project_interactions = [];

    this.environments = [];
    this.target_environment_names = [];

    this.consumer_ids = [];
    this.provider_ids = [];

    this.provider_analyses = [];
    this.provider_flows = [];
    this.consumer_analyses = [];
    this.consumer_interactions = [];

    this.compatibility_results = [];
    this.save = true;
    this.load_flows_and_interactions = true;
  }

  async run() {
    try {
      await this.setProjectVersion();
      await this.setProjectAnalysis();
      await this.setProjectMetric();
      await this.setConsumersAndProviders();
      await this.setEnvironments();
      await this.setConsumerAnalyses();
      await this.setProviderAnalyses();
      await this.setConsumerInteractions();
      await this.setFlows();
      await this.setInteractions();
      await this.setProviderFlows();
      await this.setConsumerCompatibilityResults();
      await this.setProviderCompatibilityResults();
      await this.saveCompatibilityResults();
    } catch (error) {
      this.log.error(error);
    }
  }

  async setProjectVersion() {
    if (!this.project_version) {
      // from outside analysis processor
      const project_environments = await this.$repo.release.get({ name: 'latest', projectId: this.project_id });
      if (project_environments.length > 0) {
        this.project_version = project_environments[0].version;
      } else {
        this.log.info(`Project "${this.project_id}" not found in "latest" environment`);
        this.project_version = '';
      }
    }
  }

  async setProjectAnalysis() {
    if (this.project_version) {
      const analyses = await this.$repo.analysis.get({ projectId: this.project_id, version: this.project_version });
      if (analyses && analyses.length > 0) {
        this.project_analysis = analyses[0];
      } else {
        throw `Analysis not found for project "${this.project_id}" with version "${this.project_version}"`;
      }
    }
  }

  async setProjectMetric() {
    if (this.project_analysis) {
      this.project_metric = await this.$repo.metrics.getAnalysisMetricsById(this.project_analysis._id);
    }
  }

  setConsumersAndProviders() {
    if (this.project_metric) {
      this.consumer_ids = this.project_metric.consumers.all;
      this.provider_ids = this.project_metric.providers.all;
    }
    if (this.project_interactions.length > 0) {
      const new_providers = this.project_interactions.map(_interaction => _interaction.provider);
      for (let i = 0; i < new_providers.length; i++) {
        const new_provider = new_providers[i];
        if (!this.provider_ids.includes(new_provider)) {
          this.provider_ids.push(new_provider);
        }
      }
    }
  }

  async setEnvironments() {
    if (this.target_environment_names.length > 0) {
      this.environments = await this.$repo.release.get({ name: { $in: this.target_environment_names } });
    } else {
      this.environments = await this.$repo.release.get();
    }
  }

  async setConsumerAnalyses() {
    const consumer_projects = this.environments.filter(_env => this.consumer_ids.includes(_env.projectId));
    const consumer_analyses_ids = consumer_projects.map(_env => _env.analysisId);
    this.consumer_analyses = await this.$repo.analysis.getByIds(consumer_analyses_ids);
  }

  async setProviderAnalyses() {
    const provider_projects = this.environments.filter(_env => this.provider_ids.includes(_env.projectId));
    const provider_analyses_ids = provider_projects.map(_env => _env.analysisId);
    this.provider_analyses = await this.$repo.analysis.getByIds(provider_analyses_ids);
  }

  async setConsumerInteractions() {
    if (this.consumer_analyses.length > 0) {
      for (let i = 0; i < this.consumer_analyses.length; i++) {
        const consumer_analysis = this.consumer_analyses[i];
        const interactions = await this.$repo.interaction.get({ analysisId: consumer_analysis._id, provider: this.project_id });
        this.consumer_interactions = this.consumer_interactions.concat(interactions);
      }
      const interaction_ids = this.consumer_interactions.map(_interaction => _interaction._id);
      const interaction_requests = await this.$repo.exchange.getRequestByIds(interaction_ids);
      const interaction_responses = await this.$repo.exchange.getResponseByIds(interaction_ids);
      for (let i = 0; i < this.consumer_interactions.length; i++) {
        const consumer_interaction = this.consumer_interactions[i];
        consumer_interaction.request = interaction_requests.find(request => request._id.toString() === consumer_interaction._id.toString());
        consumer_interaction.response = interaction_responses.find(response => response._id.toString() === consumer_interaction._id.toString());
      }
    }
  }

  async setFlows() {
    if (this.load_flows_and_interactions) {
      const flow_names_with_duplicates = this.consumer_interactions.map(_interaction => _interaction.flow);
      const flow_names = Array.from(new Set(flow_names_with_duplicates).values());
      this.project_flows = await this.$repo.flow.get({ analysisId: this.project_analysis._id, name: { $in: flow_names } });
      const flow_ids = this.project_flows.map(_flow => _flow._id);
      const flow_requests = await this.$repo.exchange.getRequestByIds(flow_ids);
      const flow_responses = await this.$repo.exchange.getResponseByIds(flow_ids);
      for (let i = 0; i < this.project_flows.length; i++) {
        const project_flow = this.project_flows[i];
        project_flow.request = flow_requests.find(request => request._id.toString() === project_flow._id.toString());
        project_flow.response = flow_responses.find(response => response._id.toString() === project_flow._id.toString());
      }
    }
  }

  async setInteractions() {
    if (this.load_flows_and_interactions) {
      this.project_interactions = await this.$repo.interaction.get({ analysisId: this.project_analysis._id });
      const interaction_ids = this.project_interactions.map(interaction => interaction._id);
      const interaction_requests = await this.$repo.exchange.getRequestByIds(interaction_ids);
      const interaction_responses = await this.$repo.exchange.getResponseByIds(interaction_ids);
      for (let i = 0; i < this.project_interactions.length; i++) {
        const project_interaction = this.project_interactions[i];
        project_interaction.request = interaction_requests.find(request => request._id.toString() === project_interaction._id.toString());
        project_interaction.response = interaction_responses.find(response => response._id.toString() === project_interaction._id.toString());
      }
    }
  }

  async setProviderFlows() {
    if (this.provider_analyses.length > 0) {
      for (let i = 0; i < this.provider_analyses.length; i++) {
        const provider_id = this.provider_analyses[i].projectId;
        const provider_interactions = this.project_interactions.filter(_interaction => _interaction.provider === provider_id);
        const flow_names = provider_interactions.map((_interaction) => _interaction.flow);
        const flows = await this.$repo.flow.get({ analysisId: this.provider_analyses[i]._id, name: { $in: flow_names } });
        this.provider_flows = this.provider_flows.concat(flows);
      }
      const flow_ids = this.provider_flows.map(_flow => _flow._id);
      const flow_requests = await this.$repo.exchange.getRequestByIds(flow_ids);
      const flow_responses = await this.$repo.exchange.getResponseByIds(flow_ids);
      for (let i = 0; i < this.provider_flows.length; i++) {
        const provider_flow = this.provider_flows[i];
        provider_flow.request = flow_requests.find(request => request._id.toString() === provider_flow._id.toString());
        provider_flow.response = flow_responses.find(response => response._id.toString() === provider_flow._id.toString());
      }
    }
  }

  async setConsumerCompatibilityResults() {
    for (let i = 0; i < this.consumer_analyses.length; i++) {
      const consumer_analysis = this.consumer_analyses[i];
      const interactions = this.consumer_interactions.filter(_interaction => _interaction.analysisId.toString() === consumer_analysis._id.toString());
      const exceptions = [];
      for (let j = 0; j < interactions.length; j++) {
        const interaction = interactions[j];
        const flow = this.project_flows.find(_flow => _flow.name === interaction.flow);
        if (!flow) {
          exceptions.push({ flow: interaction.flow, error: 'Flow Not Found' })
          continue;
        }
        this.compare(flow, interaction, interaction.flow, exceptions);
      }
      this.compatibility_results.push({
        consumer: consumer_analysis.projectId,
        consumerVersion: consumer_analysis.version,
        provider: this.project_id,
        providerVersion: this.project_version,
        status: exceptions.length > 0 ? 'FAILED' : 'PASSED',
        exceptions: exceptions,
        verifiedAt: new Date()
      });
    }
  }

  async setProviderCompatibilityResults() {
    for (let i = 0; i < this.provider_analyses.length; i++) {
      const provider_analysis = this.provider_analyses[i];
      const flows = this.provider_flows.filter(_flow => _flow.analysisId.toString() === provider_analysis._id.toString());
      const interactions = this.project_interactions.filter(_interaction => _interaction.provider === provider_analysis.projectId);
      const exceptions = [];

      const actual_flow_names = flows.map(_flow => _flow.name);
      const expected_flow_names = interactions.map(_interaction => _interaction.flow);
      const missing_flow_names = expected_flow_names.filter(_name => !actual_flow_names.includes(_name));
      for (let j = 0; j < missing_flow_names.length; j++) {
        exceptions.push({ flow: missing_flow_names[j], error: 'Flow Not Found' })
      }

      for (let j = 0; j < flows.length; j++) {
        const flow = flows[j];
        const interaction = interactions.find(_interaction => _interaction.flow === flow.name);
        if (!interaction) {
          // exceptions.push({ flow: interaction.flow, error: 'Flow Not Found' })
          continue;
        }
        this.compare(flow, interaction, interaction.flow, exceptions);
      }
      this.compatibility_results.push({
        consumer: this.project_id,
        consumerVersion: this.project_version,
        provider: provider_analysis.projectId,
        providerVersion: provider_analysis.version,
        status: exceptions.length > 0 ? 'FAILED' : 'PASSED',
        exceptions: exceptions,
        verifiedAt: new Date()
      });
    }
  }

  async saveCompatibilityResults() {
    if (this.save && this.compatibility_results.length > 0) {
      await this.$repo.compatibility.saveMany(this.compatibility_results);
    }
  }

  compare(actual, expected, flow, exceptions) {
    const req_error = this.compareRequest(actual.request, expected.request);
    if (req_error) {
      exceptions.push({ flow, error: req_error });
      return;
    }
    const res_error = this.compareResponse(actual.response, expected.response);
    if (res_error) {
      exceptions.push({ flow, error: res_error });
      return;
    }
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
    if (expected.queryParams && Object.keys(expected.queryParams).length > 0 && typeof actual.queryParams === 'undefined') {
      return `Failed to match request - Query Params Not Found`;
    } else {
      // empty object is not saved in MongoDB
      if (expected.queryParams && Object.keys(expected.queryParams).length === 0) {
        expected.queryParams = undefined;
      }
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