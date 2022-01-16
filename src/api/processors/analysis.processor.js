const CompatibilityProcessor = require('./compatibility.processor.v2');
const CleanProcessor = require('./clean.processor');

class AnalysisProcessor {

  constructor(analysis, repo, log) {
    this.project = null;
    this.projects = null;
    this.latestEnvironmentProjects = [];
    this.analysis = analysis;
    this.interactions = [];
    this.flows = [];
    this.providers = [];
    this.consumers = [];
    this.prevAnalysis = null;
    this.prevInteractions = [];
    this.prevFlows = [];
    this.prevProviders = [];
    this.prevConsumers = [];
    this.$repo = repo;
    this.log = log;
  }

  async process() {
    try {
      await this.startJob();
      await this.setProjects();
      await this.setLatestEnvironment();
      await this.setCurrentAnalysis();
      await this.setPreviousAnalysis();
      await this.processMetrics();
      await this.updateEnvironment();
      await this.updateAnalysis();
      await this.verify();
      await this.clean();
      await this.completeJob();
    } catch (error) {
      this.log.error(error);
      await this.failJob(error);
    }
  }

  async startJob() {
    await this.$repo.job.updateJob({
      _id: this.analysis._id,
      status: 'running',
      updatedAt: new Date(),
      projectId: this.analysis.projectId
    });
  }

  async completeJob() {
    await this.$repo.job.updateJob({
      _id: this.analysis._id,
      status: 'completed',
      updatedAt: new Date()
    });
  }

  async failJob(error) {
    await this.$repo.job.updateJob({
      _id: this.analysis._id,
      status: 'failed',
      message: error.toString(),
      updatedAt: new Date()
    });
  }

  async setProjects() {
    this.projects = await this.$repo.project.get();
    this.project = this.projects.find(project => project._id === this.analysis.projectId);
  }

  async setLatestEnvironment() {
    this.latestEnvironmentProjects = await this.$repo.release.get({ name: 'latest' });
  }

  async setCurrentAnalysis() {
    this.interactions = await this.$repo.interaction.get({ analysisId: this.analysis._id });
    this.flows = await this.$repo.flow.get({ analysisId: this.analysis._id });
    const providers = new Set();
    this.interactions.forEach(interaction => providers.add(interaction.provider));
    this.providers = Array.from(providers);
    const latestAnalysisIds = this.latestEnvironmentProjects.map(ep => ep.analysisId);
    const metrics = await this.$repo.metrics.getAnalysisMetricsByIds(latestAnalysisIds);
    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      const providers = metric.providers.all;
      if (providers.includes(this.project._id)) {
        this.consumers.push(metric.projectId);
      }
    }
  }

  async setPreviousAnalysis() {
    const latestProject = this.latestEnvironmentProjects.find(ev => ev.projectId === this.project._id);
    const lastAnalysisId = latestProject ? latestProject.analysisId : null;
    if (lastAnalysisId) {
      this.prevAnalysis = await this.$repo.analysis.getById(lastAnalysisId);
      this.prevInteractions = await this.$repo.interaction.get({ analysisId: lastAnalysisId });
      this.prevFlows = await this.$repo.flow.get({ analysisId: lastAnalysisId });
      const metric = await this.$repo.metrics.getAnalysisMetricsById(this.prevAnalysis._id);
      this.prevProviders = metric.providers.all;
      this.prevConsumers = metric.consumers.all;
    }
  }

  async processMetrics() {
    const metrics = {};
    const newInteractions = interactionDifferences(this.interactions, this.prevInteractions);
    const removedInteractions = interactionDifferences(this.prevInteractions, this.interactions);
    metrics.interactions = {
      all: this.interactions.map(interaction => interaction._id),
      new: newInteractions.map(interaction => interaction._id),
      removed: removedInteractions.map(interaction => interaction._id),
    };
    const newProviders = this.providers.filter(x => !this.prevProviders.includes(x));
    const removedProviders = this.prevProviders.filter(x => !this.providers.includes(x));
    metrics.providers = {
      all: this.providers,
      new: newProviders,
      removed: removedProviders,
    };
    const newConsumers = this.consumers.filter(x => !this.prevConsumers.includes(x));
    const removedConsumers = this.prevConsumers.filter(x => !this.consumers.includes(x));
    metrics.consumers = {
      all: this.consumers,
      new: newConsumers,
      removed: removedConsumers,
    };
    const newFlows = flowDifferences(this.flows, this.prevFlows);
    const removedFlows = flowDifferences(this.prevFlows, this.flows);
    metrics.flows = {
      all: this.flows.map(flow => flow._id),
      new: newFlows.map(flow => flow._id),
      removed: removedFlows.map(flow => flow._id),
    };
    metrics._id = this.analysis._id;
    metrics.projectId = this.project._id;
    await this.$repo.metrics.saveAnalysisMetrics(metrics);
  }

  async updateAnalysis() {
    await this.$repo.analysis.updateProcess(this.analysis._id, {
      processed: true,
      interactions: this.interactions.length,
      flows: this.flows.length,
      providers: this.providers.length,
      consumers: this.consumers.length
    });
  }

  async updateEnvironment() {
    await this.$repo.release.save({
      environment: 'latest',
      projectId: this.analysis.projectId,
      analysisId: this.analysis._id,
      version: this.analysis.version
    });
  }

  async verify() {
    const cp = new CompatibilityProcessor(this.$repo, this.log);
    cp.project_id = this.project._id;
    cp.project_version = this.analysis.version;
    await cp.run();
  }

  async clean() {
    const cp = new CleanProcessor(this.$repo, this.log);
    cp.project_id = this.project._id;
    await cp.run();
  }

}

function interactionDifferences(sources, targets) {
  const diff = [];
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    let found = false;
    for (let j = 0; j < targets.length; j++) {
      if (source.provider === targets[j].provider) {
        if (source.flow === targets[j].flow) {
          found = true;
          break;
        }
      }
    }
    if (!found) {
      diff.push(source);
    }
  }
  return diff;
}

function flowDifferences(sources, targets) {
  const diff = [];
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    let found = false;
    for (let j = 0; j < targets.length; j++) {
      if (source.name === targets[j].name) {
        found = true;
        break;
      }
    }
    if (!found) {
      diff.push(source);
    }
  }
  return diff;
}

module.exports = AnalysisProcessor;