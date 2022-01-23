const Relation = require('../models/relation.model');

class ReleaseRepository {

  get(query) {
    return Relation.find(query, null, { lean: true });
  }

  save(data) {
    const query = {
      environment: data.environment,
      projectId: data.projectId,
      relatedProjectId: data.relatedProjectId,
      relationType: data.relationType
    };
    data.modifiedAt = new Date();
    return Relation.updateOne(query, { $set: data }, { upsert: true });
  }

  saveMany(relations) {
    const ops = [];
    for (let i = 0; i < relations.length; i++) {
      const data = relations[i];
      ops.push({
        updateOne: {
          filter: {
            environment: data.environment,
            projectId: data.projectId,
            relatedProjectId: data.relatedProjectId,
            relationType: data.relationType
          },
          update: {
            $set: data
          },
          upsert: true
        }
      });
    }
    return Relation.bulkWrite(ops);
  }

  deleteByEnvironment(environment) {
    return Relation.deleteMany({ environment });
  }

  deleteByProjectId(projectId) {
    return Relation.deleteMany({ projectId });
  }

  deleteByRelatedProjectConsumers(relatedProjectId) {
    return Relation.deleteMany({ relatedProjectId, relationType: 'consumer' });
  }

}

module.exports = ReleaseRepository;