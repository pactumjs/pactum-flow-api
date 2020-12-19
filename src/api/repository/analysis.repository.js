const Analysis = require('../models/analysis.model');

class AnalysisRepository {

  get(query) {
    return Analysis.find(query);
  }

  getById(_id) {
    return Analysis.findById({ _id });
  }

  getByIds(ids) {
    return Analysis.find({ _id: { $in: ids } });
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
    return Analysis.deleteMany({ projectId: id });
  }

  addFlow(_id, flowId) {
    return Analysis.updateOne({ _id }, { $push: { flows: flowId } });
  }

  addInteraction(_id, interactionId) {
    return Analysis.updateOne({ _id }, { $push: { interactions: interactionId } });
  }

  updateProviders(_id, providers) {
    return Analysis.updateOne({ _id }, { $set : { providers }});
  }

}

module.exports = AnalysisRepository;