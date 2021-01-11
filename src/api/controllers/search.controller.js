const SearchService = require('../services/search.service');

function postSearchAnalyses(req, res) {
  new SearchService(req, res).postSearchAnalysesResponse();
}

function postSearchInteractions(req, res) {
  new SearchService(req, res).postSearchInteractionsResponse();
}

function postSearchFlows(req, res) {
  new SearchService(req, res).postSearchFlowsResponse();
}

module.exports = {
  postSearchAnalyses,
  postSearchInteractions,
  postSearchFlows
};