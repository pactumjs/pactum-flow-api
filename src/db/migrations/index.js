const Analysis = require('../../api/models/analysis.model');
const Environment = require('../../api/models/environment.model');
const Release = require('../../api/models/release.model');

async function run() {
  const releases = await Release.find({}, null, { lean: true });
  if (releases.length === 0) {
    console.log("Running Migrations - Environment => Release")
    const envs = await Environment.find({}, null, { lean: true });
    for (let i = 0; i < envs.length; i++) {
      const env = envs[i];
      const analyses_ids = Object.values(env.projects);
      const analyses = await Analysis.find({ _id: { $in: analyses_ids } }, null, { lean: true });
      for (let j = 0; j < analyses.length; j++) {
        const analysis = analyses[j];
        const release = new Release({
          name: env._id,
          projectId: analysis.projectId,
          analysisId: analysis._id,
          version: analysis.version,
          publishedAt: analysis.createdAt
        });
        await release.save();
      }
    }
  }
}

module.exports = { run };