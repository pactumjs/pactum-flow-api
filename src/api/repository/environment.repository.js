const EnvironmentV2 = require('../models/environment.v2.model');

class EnvironmentRepository {

  get(query) {
    return EnvironmentV2.find(query, null, { lean: true });
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
    return EnvironmentV2.updateOne(query, { $set: record }, { upsert: true });
  }

  delete(_id) {
    return EnvironmentV2.deleteOne({ name: _id });
  }

  deleteAnalysis(analysis) {
    return EnvironmentV2.deleteMany({ analysisId: analysis._id });
  }

  deleteProject(project) {
    return EnvironmentV2.deleteMany({ projectId: project });
  }

}

module.exports = EnvironmentRepository;