const ExchangeService = require('../services/exchange.service');

function getExchangeRequestById(req, res) {
  new ExchangeService(req, res).getExchangeRequestResponse();
}

function getExchangeResponseById(req, res) {
  new ExchangeService(req, res).getExchangeResponseResponse();
}


module.exports = {
  getExchangeRequestById,
  getExchangeResponseById
};