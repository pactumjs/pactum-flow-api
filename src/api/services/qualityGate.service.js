const BaseService = require('./base.service');

class QualityGateService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getQualityGateStatus() {
    try {
      const projectId = this.req.query.projectId;
      const version = this.req.query.version;
      const environment_name = this.req.query.environment;

      const analysis = await this.getAnalysis(projectId, version);
      const { consumers, providers } = await this.getConsumersAndProviders(analysis._id)
      const environments = await this.getEnvironments(projectId, environment_name);

      const envStatuses = [];
      for (let i = 0; i < environments.length; i++) {
        const params = { projectId, version, environment: environments[i], consumers, providers }
        envStatuses.push(await this.getEnvironmentQualityGateStatus(params));
      }
      this.res.status(200).json(envStatuses);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAnalysis(projectId, version) {
    const analyses = await this.$repo.analysis.get({
      projectId,
      version
    });
    if (analyses.length === 0) {
      throw new this.$error.ClientRequestError('Project & Version Combination Not Found');
    }
    return analyses[0];
  }

  async getConsumersAndProviders(analysisId) {
    const metrics = await this.$repo.metrics.getAnalysisMetricsById(analysisId);
    const consumers = metrics.consumers.all;
    const providers = metrics.providers.all;
    return { consumers, providers };
  }

  async getEnvironments(projectId, environment_name) {
    let environments = await this.$repo.environment.get();
    if (environment_name) {
      environments = environments.filter(environment => environment._id === environment_name);
    } else {
      environments = environments.filter(environment => environment.projects[projectId]);
    }
    if (environments.length === 0) {
      throw new this.$error.ClientRequestError('Environment Not Found');
    }
    return environments;
  }

  async getEnvironmentQualityGateStatus({ projectId, version, environment, consumers, providers, results }) {
    const envStatus = {
      environment: environment._id,
      status: 'OK',
      consumers: [],
      providers: []
    };
    const projects = environment.projects;
    for (let j = 0; j < consumers.length; j++) {
      const consumer = consumers[j];
      const consumerAnalysisId = projects[consumer];
      if (consumerAnalysisId) {
        const consumerAnalysis = await this.$repo.analysis.getById(consumerAnalysisId);
        const consumerVersion = consumerAnalysis.version;
        const query = {
          provider: projectId,
          providerVersion: version,
          consumer,
          consumerVersion
        };
        const compatibilities = await this.getCompatibilityResults(query, results);
        if (compatibilities.length > 0) {
          const compatibility = compatibilities[0];
          envStatus.consumers.push({
            name: consumer,
            version: consumerVersion,
            status: compatibility.status,
            message: '',
            exceptions: compatibility.exceptions
          });
        } else {
          envStatus.consumers.push({
            name: consumer,
            version: consumerVersion,
            status: 'ERROR',
            message: 'Compatibility Results Not Found',
            exceptions: []
          });
        }
      } else {
        this.req.log.info(`Consumer Not Found - '${consumer}'`);
      }
    }
    for (let j = 0; j < providers.length; j++) {
      const provider = providers[j];
      const providerAnalysisId = projects[provider];
      if (providerAnalysisId) {
        const providerAnalysis = await this.$repo.analysis.getById(providerAnalysisId);
        const providerVersion = providerAnalysis.version;
        const query = {
          consumer: projectId,
          consumerVersion: version,
          provider,
          providerVersion
        };
        const compatibilities = await this.getCompatibilityResults(query, results);
        if (compatibilities.length > 0) {
          const compatibility = compatibilities[0];
          envStatus.providers.push({
            name: provider,
            version: providerVersion,
            status: compatibility.status,
            message: '',
            exceptions: compatibility.exceptions
          });
        } else {
          envStatus.providers.push({
            name: provider,
            version: providerVersion,
            status: 'ERROR',
            message: 'Compatibility Results Not Found',
            exceptions: []
          });
        }
      } else {
        envStatus.providers.push({
          name: provider,
          version: '',
          status: 'ERROR',
          message: 'Project Not Found',
          exceptions: []
        });
      }
    }
    const isConsumersFailed = envStatus.consumers.some((consumer) => {
      return consumer.status === 'FAILED' || consumer.status === 'ERROR';
    });
    if (isConsumersFailed) {
      envStatus.status = 'ERROR';
    } else {
      const isProvidersFailed = envStatus.providers.some((provider) => {
        return provider.status === 'FAILED' || provider.status === 'ERROR';
      });
      if (isProvidersFailed) {
        envStatus.status = 'ERROR';
      } else {
        envStatus.status = 'OK';
      }
    }
    return envStatus;
  }

  getCompatibilityResults(query, results) {
    if (results) {
      return results.filter(_result => {
        return _result.provider === query.provider && _result.providerVersion === query.providerVersion && _result.consumer === query.consumer && _result.consumerVersion === query.consumerVersion
      });
    } else {
      return this.$repo.compatibility.get(query);
    }
  }

  async verifyQualityGateStatus() {
    try {
      const { projectId, environments: environment_names, compatibility_results } = this.req.body;

      let environments = await this.$repo.environment.get();
      const latest_environment = environments.find(_env => _env._id === 'latest');
      const latest_project_analysis_id = latest_environment.projects[projectId];
      const version = (await this.$repo.analysis.getById(latest_project_analysis_id)).version;
      const { consumers, providers } = await this.getConsumersAndProviders(latest_project_analysis_id);

      if (environment_names.length > 0) {
        environments = environments.filter(_env => environment_names.includes(_env._id));
      } else {
        environments = await this.getEnvironments(projectId);
      }

      const envStatuses = [];
      for (let i = 0; i < environments.length; i++) {
        const params = { projectId, version, environment: environments[i], consumers, providers, results: compatibility_results };
        envStatuses.push(await this.getEnvironmentQualityGateStatus(params));
      }

      this.res.status(200).json(envStatuses);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = QualityGateService;