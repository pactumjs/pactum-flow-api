const BaseService = require('./base.service');

class InteractionService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getInteractionByIdResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const doc = await this.$repo.interaction.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getInteractionsResponse() {
    try {
      const doc = await this.$repo.interaction.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postInteractionsResponse() {
    try {
      const interactions = this.req.body;
      const docs = [];
      const analyses = [];
      for (let i = 0; i < interactions.length; i++) {
        const interaction = interactions[i];
        let analysis = analyses.find(_analysis => _analysis._id.toString() === interaction.analysisId.toString());
        if (!analysis) {
          analysis = await this.$repo.analysis.getById(interaction.analysisId);
          if (analysis) {
            analyses.push(analysis);
          }
        }
        if (analysis) {
          if (analysis.processed) {
            // throw analysis already processed error
          } else {
            const { request, response } = interaction;
            interaction.projectId = analysis.projectId;
            interaction.info = `${request.method}::${request.path}::${response.statusCode}`;
            const doc = await this.$repo.interaction.save(interaction);
            request._id = doc._id;
            request.projectId = interaction.projectId;
            request.analysisId = interaction.analysisId;
            await this.$repo.exchange.saveRequest(request);
            response._id = doc._id;
            response.projectId = interaction.projectId;
            response.analysisId = interaction.analysisId;
            await this.$repo.exchange.saveResponse(response);
            docs.push(doc);
          }
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