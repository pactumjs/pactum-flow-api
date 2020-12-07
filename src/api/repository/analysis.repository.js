const Analysis = require('../models/analysis.model');

class AnalysisRepository {

  get(query) {
    return Analysis.find(query);
  }

  getById(_id) {
    return Analysis.findById({_id});
  }

  async save(data) {
    const analysis = new Analysis(data);
    const doc = await analysis.save();
    return doc;
  }

  delete(id) {
    return Analysis.deleteOne({ _id: id });
  }

  deleteByProjectId(id) {
    return Analysis.deleteMany({ projectId: id});
  }

  addFlow(_id, flowId) {
    return Analysis.updateOne({ _id}, { $push: { flows: flowId }});
  }

}

module.exports = AnalysisRepository;