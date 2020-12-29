const BaseService = require('./base.service');

class ExchangeService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getExchangeRequestResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const doc = await this.$repo.exchange.getRequestById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getExchangeResponseResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const doc = await this.$repo.exchange.getResponseById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = ExchangeService;