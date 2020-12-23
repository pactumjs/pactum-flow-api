const { AnalysisMetrics, ProjectMetrics } = require('../models/metrics.model');

class MetricsRepository {

  getAnalysisMetricsById(_id) {
    return AnalysisMetrics.findById({ _id });
  }

  saveAnalysisMetrics(data) {
    return AnalysisMetrics.updateOne({ _id: data._id }, data, { upsert: true });
  }

  getProjectMetrics() {
    return ProjectMetrics.find();
  }

  saveProjectMetrics(data) {
    return ProjectMetrics.updateOne({ _id: data._id }, data, { upsert: true });
  }

}

module.exports = MetricsRepository;