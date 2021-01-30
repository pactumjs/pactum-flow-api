const Environment = require('../models/environment.model');

class EnvironmentRepository {

  get() {
    return Environment.find(null, null, {lean: true});
  }

  save(data) {
    const key = {};
    key[`projects.${data.projectId}`] = data.version;
    return Environment.updateOne({ _id: data.environment }, { $set: key }, { upsert: true });
  }

  async deleteAnalysis(data) {
    const analysis = data.toObject();
    const envs = await Environment.find();
    for (let i = 0; i < envs.length; i++) {
      const env = envs[i].toObject();
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
    const envs = await Environment.find();
    for (let i = 0; i < envs.length; i++) {
      const env = envs[i].toObject();
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