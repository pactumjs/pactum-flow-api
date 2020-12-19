const AnalysisRepository = require('../repository/analysis.repository');
const ProjectRepository = require('../repository/project.repository');
const InteractionRepository = require('../repository/interaction.repository');
const FlowRepository = require('../repository/flow.repository');

class AnalysisProcessor {

  constructor(analysis) {
    this.analysis = analysis;
  }

  async process() {
    await this.processInteractions();
    await this.addAnalysisToProject();
  }

  async processInteractions() {
    if (this.analysis.interactions.length > 0) {
      const interactionRepo = new InteractionRepository();
      const interactions = await interactionRepo.getByIds(this.analysis.interactions);
      const providers = new Set();
      interactions.forEach(interaction => providers.add(interaction.provider));
      const analysisRepo = new AnalysisRepository();
      await analysisRepo.updateProviders(this.analysis._id, Array.from(providers));
    }
  }

  async addAnalysisToProject() {
    const projectRepo = new ProjectRepository();
    await projectRepo.addAnalysis(this.analysis.projectId, this.analysis);
  }

  getProject() {
    const projectRepo = new ProjectRepository();
    return projectRepo.getById(this.analysis.projectId);
  }

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
      const processor = new AnalysisProcessor(analysis);
      processor.process();
      this.res.status(202).json({ id });
    } catch (error) {
      handlerError(this.res, error);
    }
  }

}

function handlerError(res, error) {
  console.log(error);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = ProcessorService;