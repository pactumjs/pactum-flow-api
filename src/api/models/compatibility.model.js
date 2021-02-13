const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ErrorSchema = new Schema({
  flow: { type: String, required: true },
  error: { type: String, required: true },
});

const CompatibilitySchema = new Schema({
  consumer: { type: String, required: true },
  consumerVersion: { type: String, required: true },
  provider: { type: String, required: true },
  providerVersion: { type: String, required: true },
  status: { type: String, required: true },
  exceptions: { type: [ErrorSchema], default: [] },
  verifiedAt: { type: Date, required: true }
});

CompatibilitySchema.index({ consumer: 1, consumerVersion: 1, provider: 1, providerVersion: 1 });

module.exports = mongoose.model('Compatibility', CompatibilitySchema);