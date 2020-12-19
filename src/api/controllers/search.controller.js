const SearchService = require('../services/search.service');

function postSearchInteractions(req, res) {
  new SearchService(req, res).postSearchInteractionsResponse();
}

function postSearchFlows(req, res) {
  new SearchService(req, res).postSearchFlowsResponse();
}

module.exports = {
  postSearchInteractions,
  postSearchFlows
};