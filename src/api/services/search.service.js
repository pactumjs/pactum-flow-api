const BaseService = require('./base.service');
const AnalysisRepository = require('../repository/analysis.repository');
const InteractionRepository = require('../repository/interaction.repository');
const FlowRepository = require('../repository/flow.repository');

class InteractionService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async postSearchAnalysesResponse() {
    try {
      const analysisRepo = new AnalysisRepository();
      const doc = await analysisRepo.getByIds(this.req.body.ids);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postSearchInteractionsResponse() {
    try {
      const interactionRepo = new InteractionRepository();
      const doc = await interactionRepo.getByIds(this.req.body.ids);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postSearchFlowsResponse() {
    try {
      const flowRepo = new FlowRepository();
      const doc = await flowRepo.getByIds(this.req.body.ids);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = InteractionService;