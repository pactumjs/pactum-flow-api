const ProjectRepository = require('../repository/project.repository');
const AnalysisRepository = require('../repository/analysis.repository');
const FlowRepository = require('../repository/flow.repository');

class ProjectService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async getProjectResponse() {
    try {
      const projectRepo = new ProjectRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await projectRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async getProjectsResponse() {
    try {
      const projectRepo = new ProjectRepository();
      const doc = await projectRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async postProjectResponse() {
    try {
      const projectRepo = new ProjectRepository();
      const project = this.req.body;
      project.createdAt = new Date();
      const doc = await projectRepo.save(project);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async deleteProjectResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const flowRepo = new FlowRepository();
      await flowRepo.deleteByProjectId(id);
      const analysisRepo = new AnalysisRepository();
      await analysisRepo.deleteByProjectId(id);
      const projectRepo = new ProjectRepository();
      const doc = await projectRepo.delete(id);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

}

function handlerError(res, error) {
  console.log(error);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = ProjectService;