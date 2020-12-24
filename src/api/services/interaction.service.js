const BaseService = require('./base.service');
const InteractionRepository = require('../repository/interaction.repository');
const AnalysisRepository = require('../repository/analysis.repository');

class InteractionService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getInteractionByIdResponse() {
    try {
      const interactionRepo = new InteractionRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await interactionRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getInteractionsResponse() {
    try {
      const interactionRepo = new InteractionRepository();
      const doc = await interactionRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postInteractionsResponse() {
    try {
      const interactionRepo = new InteractionRepository();
      const analysisRepo = new AnalysisRepository();
      const interactions = this.req.body;
      const docs = [];
      const analyses = [];
      for (let i = 0; i < interactions.length; i++) {
        const interaction = interactions[i];
        let analysis = analyses.find(_analysis => _analysis._id.toString() === interaction.analysisId.toString());
        if (!analysis) {
          analysis =  await analysisRepo.getById(interaction.analysisId);
          if (analysis) {
            analyses.push(analysis);
          }
        }
        if (analysis) {
          interaction.projectId = analysis.projectId;
          const doc = await interactionRepo.save(interaction);
          await analysisRepo.addInteraction(interaction.analysisId, doc._id);
          docs.push(doc);
        } else {
          // throw analysis not found error
        }
      }
      this.res.status(200).json(docs);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = InteractionService;