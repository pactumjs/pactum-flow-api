const BaseService = require('./base.service');

class InteractionService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async postSearchAnalysesResponse() {
    try {
      const doc = await this.$repo.analysis.getByIds(this.req.body.ids);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postSearchInteractionsResponse() {
    try {
      const doc = await this.$repo.interaction.getByIds(this.req.body.ids);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postSearchFlowsResponse() {
    try {
      const doc = await this.$repo.flow.getByIds(this.req.body.ids);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = InteractionService;