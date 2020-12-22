const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
  projectId: { type: String, required: true },
  branch: { type: String, default: 'main' },
  version: { type: String, default: 'NA' },
  createdAt: { type: Date, required: true },
  interactions: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  flows: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  consumers: [ { type: String, default: [] }],
  providers: [ { type: String, default: [] }],
  metrics: { type: mongoose.Schema.Types.ObjectId, default: '' }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);