const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  projectId: { type: String },
  analysisId: { type: mongoose.Schema.Types.ObjectId },
  method: { type: String, required: true },
  path: { type: String, required: true },
  pathParams: { type: Object },
  queryParams: { type: Object },
  headers: { type: Object },
  body: { type: mongoose.Schema.Types.Mixed },
  matchingRules: { type: String }
});

const ResponseSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  projectId: { type: String },
  analysisId: { type: mongoose.Schema.Types.ObjectId },
  statusCode: { type: Number, required: true },
  headers: { type: Object },
  body: { type: mongoose.Schema.Types.Mixed },
  matchingRules: { type: String }
});

module.exports = {
  RequestSchema: mongoose.model('Request', RequestSchema),
  ResponseSchema: mongoose.model('Response', ResponseSchema)
};