const Environment = require('../models/environment.model');

class EnvironmentRepository {

  get() {
    return Environment.find(null, null, { lean: true });
  }

  getById(_id) {
    return Environment.findById({ _id }, null, { lean: true });
  }

  save(data) {
    const key = {};
    key[`projects.${data.projectId}`] = data.version;
    return Environment.updateOne({ _id: data.environment }, { $set: key }, { upsert: true });
  }

  delete(_id) {
    return Environment.deleteOne({ _id });
  }

  async deleteAnalysis(analysis) {
    const envs = await this.get();
    for (let i = 0; i < envs.length; i++) {
      const env = envs[i];
      if (env.projects[analysis.projectId].toString() === analysis._id.toString()) {
        if ((Object.keys(env.projects).length > 1)) {
          const unset = {};
          unset[`projects.${data.projectId}`] = "";
          await Environment.updateOne({ _id: env._id }, { $unset: unset });
        } else {
          await Environment.deleteOne({ _id: env._id });
        }
      }
    }
  }

  async deleteProject(project) {
    const envs = await this.get();
    for (let i = 0; i < envs.length; i++) {
      const env = envs[i];
      if (env.projects[project]) {
        if ((Object.keys(env.projects).length > 1)) {
          const unset = {};
          unset[`projects.${project}`] = "";
          await Environment.updateOne({ _id: env._id }, { $unset: unset });
        } else {
          await Environment.deleteOne({ _id: env._id });
        }
      }
    }
  }

}

module.exports = EnvironmentRepository;