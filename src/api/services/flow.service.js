const BaseService = require('./base.service');
const FlowRepository = require('../repository/flow.repository');
const AnalysisRepository = require('../repository/analysis.repository');
const ExchangeRepository = require('../repository/exchange.repository');

class FlowService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getFlowResponse() {
    try {
      const flowRepo = new FlowRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await flowRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFlowsResponse() {
    try {
      const flowRepo = new FlowRepository();
      const doc = await flowRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postFlowsResponse() {
    try {
      const flowRepo = new FlowRepository();
      const analysisRepo = new AnalysisRepository();
      const exchangeRepo = new ExchangeRepository();
      const flows = this.req.body;
      const docs = [];
      const analyses = [];
      for (let i = 0; i < flows.length; i++) {
        const flow = flows[i];
        let analysis = analyses.find(_analysis => _analysis._id.toString() === flow.analysisId.toString());
        if (!analysis) {
          analysis = await analysisRepo.getById(flow.analysisId);
          if (analysis) {
            analyses.push(analysis);
          }
        }
        // TODO - check if analysis is already processed
        if (analysis) {
          flow.projectId = analysis.projectId;
          // TODO - add info
          const doc = await flowRepo.save(flow);
          await analysisRepo.addFlow(flow.analysisId, doc._id);
          flow.request._id = doc._id;
          flow.request.projectId = flow.projectId;
          flow.request.analysisId = flow.analysisId;
          await exchangeRepo.saveRequest(flow.request);
          flow.response._id = doc._id;
          flow.response.projectId = flow.projectId;
          flow.response.analysisId = flow.analysisId;
          await exchangeRepo.saveResponse(flow.response);
          docs.push(doc);
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

module.exports = FlowService;