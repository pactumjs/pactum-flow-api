const FlowRepository = require('../repository/flow.repository');
const AnalysisRepository = require('../repository/analysis.repository');

class FlowService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async getFlowResponse() {
    try {
      const flowRepo = new FlowRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await flowRepo.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async getFlowsResponse() {
    try {
      const flowRepo = new FlowRepository();
      const doc = await flowRepo.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async postFlowsResponse() {
    try {
      const flowRepo = new FlowRepository();
      const analysisRepo = new AnalysisRepository();
      const flows = this.req.body;
      const docs = [];
      for (let i = 0; i < flows.length; i++) {
        const flow = flows[i];
        flow.createdAt = new Date();
        const doc = await flowRepo.save(flow);
        await analysisRepo.addFlow(flow.analysisId, doc._id);
        docs.push(doc);
      }
      this.res.status(200).json(docs);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

}

function handlerError(res, error) {
  console.log(error);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = FlowService;