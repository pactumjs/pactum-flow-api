const Flow = require('../models/flow.model');

class FlowRepository {

  get(query) {
    return Flow.find(query, null, { lean: true });
  }

  getById(_id) {
    return Flow.findById({ _id }, null, { lean: true });
  }

  getByIds(ids) {
    return Flow.find({ _id: { $in: ids } }, null, { lean: true });
  }

  async save(data) {
    const flow = new Flow(data);
    const doc = await flow.save();
    return doc;
  }

  delete(id) {
    return Flow.deleteOne({ _id: id });
  }

  deleteByProjectId(id) {
    return Flow.deleteMany({ projectId: id });
  }

  deleteByAnalysisId(id) {
    return Flow.deleteMany({ analysisId: id });
  }

}

module.exports = FlowRepository;