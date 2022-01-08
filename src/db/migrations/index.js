const Analysis = require('../../api/models/analysis.model');
const Environment = require('../../api/models/environment.model');
const EnvironmentV2 = require('../../api/models/environment.v2.model');

async function run() {
  const env_v2s = await EnvironmentV2.find({}, null, { lean: true });
  if (env_v2s.length === 0) {
    console.log("Running Migrations - Environment => Environment v2")
    const envs = await Environment.find({}, null, { lean: true });
    for (let i = 0; i < envs.length; i++) {
      const env = envs[i];
      const analyses_ids = Object.values(env.projects);
      const analyses = await Analysis.find({ _id: { $in: analyses_ids } }, null, { lean: true });
      for (let j = 0; j < analyses.length; j++) {
        const analysis = analyses[j];
        const env_v2 = new EnvironmentV2({
          name: env._id,
          projectId: analysis.projectId,
          analysisId: analysis._id,
          version: analysis.version,
          publishedAt: analysis.createdAt
        });
        await env_v2.save();
      }
    }
  }
}

module.exports = { run };