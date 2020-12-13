const ProjectRepository = require('../repository/project.repository');
const AnalysisRepository = require('../repository/analysis.repository');

class MetricService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async getProjectMetricsResponse() {
    try {
      const metrics = [];
      const projects = await getProjects();
      const ids = [];
      for(let i = 0; i < projects.length; i++) {
        ids.push(projects[i].lastAnalysisId);
      }
      const analyses = await getAnalysis(ids);
      for(let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const analysis = analyses.find(_analysis => _analysis._id.toString() === project.lastAnalysisId.toString());
        if (analysis) {
          const metric = {};
          metric._id = project._id;
          metric.name = project.name;
          metric.flows = analysis.flows.length;
          metric.consumers = analysis.consumers.length;
          metric.providers = analysis.providers.length;
          metrics.push(metric);
        } else {
          console.warn(`Analysis - ${project.lastAnalysisId} not found for Project - ${project._id}`);
        }
      }
      this.res.status(200).json(metrics);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

}

async function getProjects() {
  const projects = [];
  const projectRepo = new ProjectRepository();
  const projectDocs = await projectRepo.get();
  for(let i = 0; i < projectDocs.length; i++) {
    const project = {};
    const projectDoc = projectDocs[i];
    const ids = projectDoc.analysis.main;
    if (ids.length > 0) {
      project._id = projectDoc._id;
      project.name = projectDoc.name;
      project.lastAnalysisId = ids[ids.length - 1];
      projects.push(project);
    } else {
      console.warn(`Project - ${projectDoc._id} doesn't have main analysis`);
    }
  }
  return projects;
}

function getAnalysis(ids) {
  const analysisRepo = new AnalysisRepository();
  return analysisRepo.getByIds(ids);
}

function handlerError(res, error) {
  console.log(error);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = MetricService;