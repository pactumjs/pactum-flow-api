const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  branch: { type: String, required: true },
  version: { type: String, required: true },
  createdAt: { type: Date, required: true },
  flows: { type: [mongoose.Schema.Types.ObjectId], default: [] }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);