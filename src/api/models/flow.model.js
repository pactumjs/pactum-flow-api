const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FlowSchema = new Schema({
  name: { type: String, required: true },
  projectId: { type: String, required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, required: true },
});

FlowSchema.index({ analysisId: 1, name: 1}, { unique: true });

module.exports = mongoose.model('Flow', FlowSchema);