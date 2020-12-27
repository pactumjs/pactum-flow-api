const { RequestSchema, ResponseSchema } = require('../models/exchange.model');

class ExchangeRepository {

  getRequestById(_id) {
    return RequestSchema.findById({_id});
  }

  getResponseById(_id) {
    return ResponseSchema.findById({_id});
  }

  async saveRequest(data) {
    const request = new RequestSchema(data);
    const doc = await request.save();
    return doc;
  }

  async saveResponse(data) {
    const response = new ResponseSchema(data);
    const doc = await response.save();
    return doc;
  }

  deleteRequestByProjectId(id) {
    return RequestSchema.deleteMany({ projectId: id});
  }

  deleteResponseByProjectId(id) {
    return ResponseSchema.deleteMany({ projectId: id});
  }

  deleteRequestByAnalysisId(id) {
    return RequestSchema.deleteMany({ analysisId: id});
  }

  deleteResponseByAnalysisId(id) {
    return ResponseSchema.deleteMany({ analysisId: id});
  }

}

module.exports = ExchangeRepository;