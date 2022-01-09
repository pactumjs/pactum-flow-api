const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReleaseSchema = new Schema({
  name: { type: String, required: true },
  projectId: { type: String, required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, required: true },
  version: { type: String, required: true },
  publishedAt: { type: Date, required: true },
});

ReleaseSchema.index({ projectId: 1, name: 1}, { unique: true });

module.exports = mongoose.model('Release', ReleaseSchema);