const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, required: true },
  analysis: {
    main: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    branch: { type: [mongoose.Schema.Types.ObjectId], default: [] }
  }
});

module.exports = mongoose.model('Project', ProjectSchema);