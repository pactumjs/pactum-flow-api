const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AnalysisMetrics = new Schema({
  metrics: {
    type: [
      {
        name: { type: String, default: '' },
        new: { type: [String], default: [] },
        removed: { type: [String], default: [] }
      }
    ],
    default: []
  }
});

module.exports = mongoose.model('AnalysisMetrics', AnalysisMetrics);