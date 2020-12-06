const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, required: true }
});

module.exports = mongoose.model('Project', ProjectSchema);