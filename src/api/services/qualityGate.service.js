const BaseService = require('./base.service');

class QualityGateService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getQualityGateStatus() {
    try {
      const projectId = this.req.query.projectId;
      const version = this.req.query.version;
      const analyses = await this.$repo.analysis.get({
        projectId,
        version
      });
      if (analyses.length === 0) {
        throw new this.$error.ClientRequestError('Project & Version Combination Not Found');
      }
      const analysis = analyses[0];
      const metrics = await this.$repo.metrics.getAnalysisMetricsById(analysis._id);
      const consumers = metrics.consumers.all;
      const providers = metrics.providers.all;
      const environments = await this.$repo.environment.get();
      const envStatuses = [];
      for (let i = 0; i < environments.length; i++) {
        const environment = environments[i];
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
            const compatibilities = await this.$repo.compatibility.get({
              provider: projectId,
              providerVersion: version,
              consumer,
              consumerVersion
            });
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
            console.log(`Consumer Not Found - '${consumer}'`);
          }
        }
        for (let j = 0; j < providers.length; j++) {
          const provider = providers[j];
          const providerAnalysisId = projects[provider];
          if (providerAnalysisId) {
            const providerAnalysis = await this.$repo.analysis.getById(providerAnalysisId);
            const providerVersion = providerAnalysis.version;
            const compatibilities = await this.$repo.compatibility.get({
              consumer: projectId,
              consumerVersion: version,
              provider,
              providerVersion
            });
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
        envStatuses.push(envStatus);
      }
      this.res.status(200).json(envStatuses);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = QualityGateService;