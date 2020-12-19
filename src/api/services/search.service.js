const AnalysisRepository = require('../repository/analysis.repository');
const InteractionRepository = require('../repository/interaction.repository');
const FlowRepository = require('../repository/flow.repository');

class InteractionService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async postSearchAnalysesResponse() {
    try {
      const analysisRepo = new AnalysisRepository();
      const doc = await analysisRepo.getByIds(this.req.body.ids);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async postSearchInteractionsResponse() {
    try {
      const interactionRepo = new InteractionRepository();
      const doc = await interactionRepo.getByIds(this.req.body.ids);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async postSearchFlowsResponse() {
    try {
      const flowRepo = new FlowRepository();
      const doc = await flowRepo.getByIds(this.req.body.ids);
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

module.exports = InteractionService;