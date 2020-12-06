const FlowRepository = require('../repository/flow.repository');

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

  async postFlowResponse() {
    try {
      const flowRepo = new FlowRepository();
      const flow = this.req.body;
      flow.createdAt = new Date();
      const doc = await flowRepo.save(flow);
      this.res.status(200).json(doc);
    } catch (error) {
      handlerError(this.res, error);
    }
  }

  async deleteFlowResponse() {
    try {
      const flowRepo = new FlowRepository();
      const id = this.req.swagger.params.id.value;
      const doc = await flowRepo.delete(id);
      this.res.status(200).json(doc);
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