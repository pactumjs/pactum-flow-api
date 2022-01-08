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
      const unique_environment_names = Array.from(new Set(environments.map(_env => _env.name)));
      for (let i = 0; i < unique_environment_names.length; i++) {
        const environment_projects = environments.filter(_env => _env.name === unique_environment_names[i]);
        const params = { projectId, version, environment: unique_environment_names[i], consumers, providers, environment_projects };
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
      environments = environments.filter(_env => _env.name === environment_name);
    } else {
      const project_environments = environments.filter(_env => _env.projectId === projectId);
      const unique_environment_names = Array.from(new Set(project_environments.map(_env => _env.name)));
      environments = environments.filter(_env => unique_environment_names.includes(_env.name));
    }
    if (environments.length === 0) {
      throw new this.$error.ClientRequestError('Environment Not Found');
    }
    return environments;
  }

  async getEnvironmentQualityGateStatus({ projectId, version, environment, consumers, providers, results, environment_projects }) {
    const envStatus = {
      environment,
      status: 'OK',
      consumers: [],
      providers: []
    };
    for (let j = 0; j < consumers.length; j++) {
      const consumer = consumers[j];
      const env_consumer = environment_projects.find(_env => _env.projectId === consumer);
      if (env_consumer) {
        const consumerVersion = env_consumer.version;
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
      const env_provider = environment_projects.find(_env => _env.projectId === provider);
      if (env_provider) {
        const providerVersion = env_provider.version;
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

      const env_projects = await this.$repo.environment.get({ name: 'latest', projectId });
      if (env_projects.length === 0) {
        throw new this.$error.ClientRequestError('Project Not Found in latest environment');
      }
      const env_project = env_projects[0];
      const latest_project_analysis_id = env_project.analysisId;
      const version = env_project.version;
      const { consumers, providers } = await this.getConsumersAndProviders(latest_project_analysis_id);

      let environments = await this.$repo.environment.get();
      if (environment_names.length > 0) {
        environments = environments.filter(_env => environment_names.includes(_env.name));
      } else {
        const project_environments = environments.filter(_env => _env.projectId === projectId);
        const unique_environment_names = Array.from(new Set(project_environments.map(_env => _env.name)));
        environments = environments.filter(_env => unique_environment_names.includes(_env.name));
      }

      const envStatuses = [];
      const unique_environment_names = Array.from(new Set(environments.map(_env => _env.name)));
      for (let i = 0; i < unique_environment_names.length; i++) {
        const environment_projects = environments.filter(_env => _env.name === unique_environment_names[i]);
        const params = { projectId, version, environment: unique_environment_names[i], consumers, providers, results: compatibility_results, environment_projects };
        envStatuses.push(await this.getEnvironmentQualityGateStatus(params));
      }

      this.res.status(200).json(envStatuses);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = QualityGateService;