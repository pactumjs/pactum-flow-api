const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const InteractionSchema = new Schema({
  analysisId: { type: mongoose.Schema.Types.ObjectId, required: true },
  provider: { type: String, required: true },
  flow: { type: String, required: true },
  request: { type: mongoose.Schema.Types.Mixed, required: true },
  response: { type: mongoose.Schema.Types.Mixed, required: true },
});

InteractionSchema.index({ analysisId: 1, provider: 1, flow: 1}, { unique: true });

module.exports = mongoose.model('Interaction', InteractionSchema);