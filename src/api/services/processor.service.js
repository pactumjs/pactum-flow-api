const AnalysisRepository = require('../repository/analysis.repository');
const ProjectRepository = require('../repository/project.repository');
const InteractionRepository = require('../repository/interaction.repository');
const FlowRepository = require('../repository/flow.repository');
const MetricsRepository = require('../repository/metrics.repository');

class AnalysisProcessor {

  constructor(analysis, isProcessed) {
    this.project = null;
    this.projects = [];
    this.analysis = analysis;
    this.isProcessed = isProcessed;
    this.interactions = [];
    this.flows = [];
    this.providers = [];
    this.consumers = [];
    this.prevAnalysis = null;
    this.prevInteractions = [];
    this.prevFlows = [];
    this.prevProviders = [];
    this.prevConsumers = [];
  }

  async process() {
    try {
      await this.setProjects();
      await this.setCurrentAnalysis();
      await this.setPreviousAnalysis();
      await this.processAnalysis();
      await this.processMetrics();
      if (!this.isProcessed) {
        await this.addAnalysisToProject();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async setProjects() {
    const projectRepo = new ProjectRepository();
    this.projects = await projectRepo.get();
    this.project = this.projects.find(project => project._id === this.analysis.projectId);
  }

  async setCurrentAnalysis() {
    const interactionRepo = new InteractionRepository();
    this.interactions = await interactionRepo.getByIds(this.analysis.interactions);
    const flowRepo = new FlowRepository();
    this.flows = await flowRepo.getByIds(this.analysis.flows);
    const providers = new Set();
    this.interactions.forEach(interaction => providers.add(interaction.provider));
    this.providers = Array.from(providers);
    const lastAnalysisIds = [];
    for (let i = 0; i < this.projects.length; i++) {
      const project = this.projects[i];
      const ids = project.analysis.main;
      if (ids.length > 0) {
        lastAnalysisIds.push(ids[ids.length - 1]);
      }
    }
    const analysisRepo = new AnalysisRepository();
    const lastAnalyses = await analysisRepo.getByIds(lastAnalysisIds);
    for (let i = 0; i < lastAnalyses.length; i++) {
      const analysis = lastAnalyses[i];
      const providers = analysis.providers;
      if (providers.includes(this.project._id)) {
        this.consumers.push(analysis.projectId);
      }
    }
  }

  async setPreviousAnalysis() {
    const ids = this.project.analysis.main;
    if (ids.length > 0) {
      const analysisRepo = new AnalysisRepository();
      this.prevAnalysis = await analysisRepo.getById(ids[ids.length - 1]);
      const interactionRepo = new InteractionRepository();
      this.prevInteractions = await interactionRepo.getByIds(this.prevAnalysis.interactions);
      const flowRepo = new FlowRepository();
      this.prevFlows = await flowRepo.getByIds(this.prevAnalysis.flows);
      this.prevProviders = this.prevAnalysis.providers;
      this.prevConsumers = this.prevAnalysis.consumers;
    }
  }

  async processAnalysis() {
    const analysisRepo = new AnalysisRepository();
    await analysisRepo.updateProviders(this.analysis._id, this.providers);
    await analysisRepo.updateConsumers(this.analysis._id, this.consumers);
  }

  async processMetrics() {
    const metrics = [];
    const metricsRepo = new MetricsRepository();
    const newInteractions = interactionDifferences(this.interactions, this.prevInteractions);
    const removedInteractions = interactionDifferences(this.prevInteractions, this.interactions);
    metrics.push({
      name: 'Interactions',
      new: newInteractions.map(interaction => interaction._id),
      removed: removedInteractions.map(interaction => interaction._id),
    });
    const newProviders = this.providers.filter(x => !this.prevProviders.includes(x));
    const removedProviders = this.prevProviders.filter(x => !this.providers.includes(x));
    metrics.push({
      name: 'Providers',
      new: newProviders,
      removed: removedProviders,
    });
    const newConsumers = this.consumers.filter(x => !this.prevConsumers.includes(x));
    const removedConsumers = this.prevConsumers.filter(x => !this.consumers.includes(x));
    metrics.push({
      name: 'Consumers',
      new: newConsumers,
      removed: removedConsumers,
    });
    const newFlows = flowDifferences(this.flows, this.prevFlows);
    const removedFlows = flowDifferences(this.prevFlows, this.flows);
    metrics.push({
      name: 'Flows',
      new: newFlows.map(flow => flow._id),
      removed: removedFlows.map(flow => flow._id),
    });
    const data = {
      _id: this.analysis._id,
      metrics
    };
    await metricsRepo.saveAnalysisMetrics(data);
    await metricsRepo.saveProjectMetrics({
      _id: this.project._id,
      name: this.project.name,
      flows: this.flows.length,
      consumers: this.consumers.length,
      providers: this.providers.length,
      interactions: this.interactions.length
    });
  }

  async addAnalysisToProject() {
    const projectRepo = new ProjectRepository();
    await projectRepo.addAnalysis(this.analysis.projectId, this.analysis);
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

class ProcessorService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async postProcessAnalysisResponse() {
    try {
      const id = this.req.body.id;
      const analysisRepo = new AnalysisRepository();
      const analysis = await analysisRepo.getById(id);
      if (analysis) {
        const isProcessed = await isAnalysisProcessed(id);
        if (!isProcessed) {
          const processor = new AnalysisProcessor(analysis);
          processor.process();
          this.res.status(202).json({ id });
        } else {
          this.res.status(400).json({ message: 'Analysis already processed' });
        }
      } else {
        this.res.status(404).json({ message: 'Analysis Not Found' });
      }
    } catch (error) {
      handlerError(this.res, error);
    }
  }

}

async function isAnalysisProcessed(id) {
  try {
    const metricsRepo = new MetricsRepository();
    const doc = await metricsRepo.getAnalysisMetricsById(id);
    return doc ? true : false;
  } catch (error) {
    return false;
  }
}

function handlerError(res, error) {
  console.log(error);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = ProcessorService;