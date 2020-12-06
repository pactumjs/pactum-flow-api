const AnalysisRepository = require('../repository/Analysis.repository');

class AnalysisService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async getAnalysisByIdResponse() {
    try {
      const AnalysisRepo = new AnalysisRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await AnalysisRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async getAnalysisResponse() {
    try {
      const AnalysisRepo = new AnalysisRepository();
      const doc = await AnalysisRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async postAnalysisResponse() {
    try {
      const AnalysisRepo = new AnalysisRepository();
      const analysis = this.req.body;
      analysis.createdAt = new Date();
      const doc = await AnalysisRepo.save(analysis);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async deleteAnalysisResponse() {
    try {
      const AnalysisRepo = new AnalysisRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await AnalysisRepo.delete(id);
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