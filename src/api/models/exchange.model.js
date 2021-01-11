const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  projectId: { type: String },
  analysisId: { type: mongoose.Schema.Types.ObjectId },
  method: { type: String, required: true },
  path: { type: String, required: true },
  pathParams: { type: String },
  queryParams: { type: String },
  headers: { type: String },
  body: { type: String },
  matchingRules: { type: String }
});

const ResponseSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  projectId: { type: String },
  analysisId: { type: mongoose.Schema.Types.ObjectId },
  statusCode: { type: Number, required: true },
  headers: { type: String },
  body: { type: String },
  matchingRules: { type: String }
});

module.exports = {
  RequestSchema: mongoose.model('Request', RequestSchema),
  ResponseSchema: mongoose.model('Response', ResponseSchema)
};