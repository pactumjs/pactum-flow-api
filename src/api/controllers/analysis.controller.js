const AnalysisService = require('../services/analysis.service');

function getAnalyses(req, res) {
  new AnalysisService(req, res).getAnalysesResponse();
}

function getAnalysisById(req, res) {
  new AnalysisService(req, res).getAnalysisByIdResponse();
}

function postAnalysis(req, res) {
  new AnalysisService(req, res).postAnalysisResponse();
}

function deleteAnalysis(req, res) {
  new AnalysisService(req, res).deleteAnalysisResponse();
}

module.exports = {
  getAnalyses,
  getAnalysisById,
  postAnalysis,
  deleteAnalysis
};