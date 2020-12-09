const AnalysisService = require('../services/analysis.service');

function getAnalysis(req, res) {
  new AnalysisService(req, res).getAnalysisResponse();
}

function getAnalysisById(req, res) {
  new AnalysisService(req, res).getAnalysisByIdResponse();
}

function postAnalysis(req, res) {
  new AnalysisService(req, res).postAnalysisResponse();
}

function postAnalysisSearch(req, res) {
  new AnalysisService(req, res).postAnalysisSearchResponse();
}

function deleteAnalysis(req, res) {
  new AnalysisService(req, res).deleteAnalysisResponse();
}

module.exports = {
  getAnalysis,
  getAnalysisById,
  postAnalysis,
  postAnalysisSearch,
  deleteAnalysis
};