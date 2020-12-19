const ProcessorService = require('../services/processor.service');

function postProcessAnalysis(req, res) {
  new ProcessorService(req, res).postProcessAnalysisResponse();
}

module.exports = {
  postProcessAnalysis
};