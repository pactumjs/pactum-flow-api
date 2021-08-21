const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const JobSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, default: 'NA' },
  updatedAt: { type: Date, required: true },
  message: { type: String, default: '' },
  projectId: { type: String, required: true }
});

module.exports = mongoose.model('Job', JobSchema);