const BaseService = require('./base.service');

class FlowService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getFlowResponse() {
    try {
      const id = this.req.swagger.params.id.value;
      const doc = await this.$repo.flow.getById(id);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFlowsResponse() {
    try {
      const doc = await this.$repo.flow.get(this.req.query);
      this.res.status(200).json(doc);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postFlowsResponse() {
    try {
      const flows = this.req.body;
      const docs = [];
      const analyses = [];
      for (let i = 0; i < flows.length; i++) {
        const flow = flows[i];
        let analysis = analyses.find(_analysis => _analysis._id.toString() === flow.analysisId.toString());
        if (!analysis) {
          analysis = await this.$repo.analysis.getById(flow.analysisId);
          if (analysis) {
            analyses.push(analysis);
          }
        }
        if (analysis) {
          if (analysis.processed) {
            // throw analysis already processed error
          } else {
            const request = flow.request;
            const response = flow.response;
            flow.projectId = analysis.projectId;
            flow.info = `${request.method}::${request.path}::${response.statusCode}`;
            const doc = await this.$repo.flow.save(flow);
            request._id = doc._id;
            request.projectId = flow.projectId;
            request.analysisId = flow.analysisId;
            await  this.$repo.exchange.saveRequest(request);
            response._id = doc._id;
            response.projectId = flow.projectId;
            response.analysisId = flow.analysisId;
            await  this.$repo.exchange.saveResponse(response);
            docs.push(doc);
          }
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