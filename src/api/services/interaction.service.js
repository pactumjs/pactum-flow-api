const InteractionRepository = require('../repository/interaction.repository');
const AnalysisRepository = require('../repository/analysis.repository');

class InteractionService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async getInteractionByIdResponse() {
    try {
      const interactionRepo = new InteractionRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await interactionRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async getInteractionsResponse() {
    try {
      const interactionRepo = new InteractionRepository();
      const doc = await interactionRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async postInteractionsResponse() {
    try {
      const interactionRepo = new InteractionRepository();
      const analysisRepo = new AnalysisRepository();
      const interactions = this.req.body;
      const docs = [];
      for (let i = 0; i < interactions.length; i++) {
        const interaction = interactions[i];
        const doc = await interactionRepo.save(interaction);
        await analysisRepo.addInteraction(interaction.analysisId, doc._id);
        docs.push(doc);
      }
      this.res.status(200).json(docs);
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