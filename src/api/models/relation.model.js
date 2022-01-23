const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RelationSchema = new Schema({
  projectId: { type: String, required: true, index: true },
  relatedProjectId: { type: String, required: true, index: true },
  relationType: { type: String, required: true },
  checkQualityGate: { type: Boolean, default: true },
  checkCompatibility: { type: Boolean, default: true },
  environment: { type: String, required: true },
  modifiedAt: { type: Date, required: true },
});

module.exports = mongoose.model('Relation', RelationSchema);