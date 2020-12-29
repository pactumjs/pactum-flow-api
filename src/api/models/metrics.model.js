const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AnalysisMetricSchema = new Schema({
  total: { type: [String], default: [] },
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

const ProjectMetrics = new Schema({
  _id: { type: String, required: true },
  name: { type: String, default: ''} ,
  flows: { type: Number, default: 0 },
  consumers: { type: Number, default: 0 },
  providers: { type: Number, default: 0 },
  interactions: { type: Number, default: 0 }
});

module.exports = {
  AnalysisMetrics: mongoose.model('AnalysisMetrics', AnalysisMetrics),
  ProjectMetrics: mongoose.model('ProjectMetrics', ProjectMetrics)
};