const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
  projectId: { type: String, required: true },
  branch: { type: String, default: 'main' },
  version: { type: String, default: 'NA' },
  createdAt: { type: Date, required: true },
  processed: { type: Boolean, default: false },
  interactions: { type: Number, default: 0 },
  flows: { type: Number, default: 0 },
  providers: { type: Number, default: 0 },
  consumers: { type: Number, default: 0 }
});

AnalysisSchema.index({ projectId: 1, version: 1}, { unique: true });

module.exports = mongoose.model('Analysis', AnalysisSchema);