const Release = require('../models/release.model');

class ReleaseRepository {

  get(query) {
    return Release.find(query, null, { lean: true });
  }

  save(data) {
    const query = {
      name: data.environment,
      projectId: data.projectId
    };
    const record = {
      name: data.environment,
      projectId: data.projectId,
      analysisId: data.analysisId,
      version: data.version,
      publishedAt: new Date()
    }
    return Release.updateOne(query, { $set: record }, { upsert: true });
  }

  delete(_id) {
    return Release.deleteOne({ name: _id });
  }

  deleteAnalysis(id) {
    return Release.deleteMany({ analysisId: id });
  }

  deleteProject(project) {
    return Release.deleteMany({ projectId: project });
  }

}

module.exports = ReleaseRepository;