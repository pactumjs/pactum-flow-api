const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EnvironmentSchema = new Schema({
  _id: { type: String },
  projects: { type: Object }
});

module.exports = mongoose.model('Environment', EnvironmentSchema);