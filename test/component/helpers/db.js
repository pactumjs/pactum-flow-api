const pactum = require('pactum');
const Environment = require('../../../src/api/models/environment.model');

async function createProject(id, name) {
  await pactum.spec()
    .post('/api/flow/v1/projects')
    .withJson({
      "id": id || "team_login-service",
      "name": name || "[Team] login-service"
    })
    .expectStatus(200);
}

async function createAnalysis(project, version) {
  await pactum.spec()
    .post('/api/flow/v1/analyses')
    .withJson({
      "projectId": project || "team_login-service",
      "branch": "main",
      "version": version || "1.0.1"
    })
    .expectStatus(200)
    .stores('AnalysisId', '_id');
}

async function deleteAnalysis() {
  await pactum.spec()
    .delete('/api/flow/v1/analyses/{id}')
    .withPathParams('id', '$S{AnalysisId}')
    .expectStatus(200);
}

async function clean() {
  const ids = await pactum.spec()
    .get('/api/flow/v1/projects')
    .returns('[*]._id').toss();
  for (let i = 0; i < ids.length; i++) {
    await pactum.spec()
      .delete('/api/flow/v1/projects/{id}')
      .withPathParams('id', ids[i]);
  }

  await Environment.deleteMany();
}

module.exports = {
  createProject,
  createAnalysis,
  deleteAnalysis,
  clean,
};