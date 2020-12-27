const BaseService = require('./base.service');
const ExchangeRepository = require('../repository/exchange.repository');

class ExchangeService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getExchangeRequestResponse() {
    try {
      const exchangeRepo = new ExchangeRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await exchangeRepo.getRequestById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getExchangeResponseResponse() {
    try {
      const exchangeRepo = new ExchangeRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await exchangeRepo.getResponseById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = ExchangeService;