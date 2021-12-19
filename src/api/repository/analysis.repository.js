const Analysis = require('../models/analysis.model');

class AnalysisRepository {

  get(query) {
    return Analysis.find(query, null, { lean: true });
  }

  getById(_id) {
    return Analysis.findById({ _id }, null, { lean: true });
  }

  getByIds(ids) {
    return Analysis.find({ _id: { $in: ids } }, null, { lean: true });
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

  updateProcess(_id, data) {
    return Analysis.updateOne({ _id }, { $set: data });
  }

}

module.exports = AnalysisRepository;