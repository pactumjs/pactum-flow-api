const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AnalysisMetricSchema = new Schema({
  all: { type: [String], default: [] },
  new: { type: [String], default: [] },
  removed: { type: [String], default: [] }
});

const AnalysisMetrics = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  projectId: { type: String, required: true },
  flows: { type: AnalysisMetricSchema, required: true },
  interactions: { type: AnalysisMetricSchema, required: true },
  providers: { type: AnalysisMetricSchema, required: true },
  consumers: { type: AnalysisMetricSchema, required: true }
});

module.exports = {
  AnalysisMetrics: mongoose.model('AnalysisMetrics', AnalysisMetrics),
};