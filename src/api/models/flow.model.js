const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  method: { type: String, required: true },
  path: { type: String, required: true },
  pathParams: { type: Object },
  queryParams: { type: Object },
  headers: { type: Object },
  body: { type: mongoose.Schema.Types.Mixed }
});

const ResponseSchema = new Schema({
  statusCode: { type: Number, required: true },
  headers: { type: Object },
  body: { type: mongoose.Schema.Types.Mixed }
});

const FlowSchema = new Schema({
  name: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, required: true },
  request: { type: RequestSchema, required: true },
  response: { type: ResponseSchema, required: true },
  createdAt: { type: Date, required: true }
});

FlowSchema.index({ analysisId: 1, name: 1}, { unique: true });

module.exports = mongoose.model('Flow', FlowSchema);