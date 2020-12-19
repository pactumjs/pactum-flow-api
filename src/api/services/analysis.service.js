const AnalysisRepository = require('../repository/analysis.repository');
const FlowRepository = require('../repository/flow.repository');

class AnalysisService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async getAnalysisByIdResponse() {
    try {
      const analysisRepo = new AnalysisRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await analysisRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async getAnalysesResponse() {
    try {
      const analysisRepo = new AnalysisRepository();
      const doc = await analysisRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async postAnalysisResponse() {
    try {
      const analysisRepo = new AnalysisRepository();
      const analysis = this.req.body;
      analysis.createdAt = new Date();
      const doc = await analysisRepo.save(analysis);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async deleteAnalysisResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const flowRepo = new FlowRepository();
      await flowRepo.deleteByAnalysisId(id);
      const analysisRepo = new AnalysisRepository();
      const doc = await analysisRepo.delete(id);
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

module.exports = AnalysisService;