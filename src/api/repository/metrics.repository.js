const { AnalysisMetrics } = require('../models/metrics.model');

class MetricsRepository {

  getAnalysisMetricsById(_id) {
    return AnalysisMetrics.findById({ _id });
  }

  getAnalysisMetricsByIds(ids) {
    return AnalysisMetrics.find({ _id: { $in: ids } });
  }

  saveAnalysisMetrics(data) {
    return AnalysisMetrics.updateOne({ _id: data._id }, data, { upsert: true });
  }

  deleteAnalysisMetricsByProjectId(id) {
    return AnalysisMetrics.deleteMany({ projectId: id });
  }

  deleteAnalysisMetrics(_id) {
    return AnalysisMetrics.deleteOne({ _id });
  }

}

module.exports = MetricsRepository;