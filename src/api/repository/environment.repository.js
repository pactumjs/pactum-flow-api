const Environment = require('../models/environment.model');

class EnvironmentRepository {

  get() {
    return Environment.find();
  }

  save(data) {
    const key =  {};
    key[`projects.${data.projectId}`] = data.version;
    return Environment.updateOne({ _id: data.environment }, { $set: key }, { upsert: true });
  }

}

module.exports = EnvironmentRepository;