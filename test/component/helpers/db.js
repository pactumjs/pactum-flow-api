const pactum = require('pactum');
const { request } = require('pactum');
const Compatibility = require('../../../src/api/models/compatibility.model');

request.setBaseUrl('http://localhost:3000');
request.setDefaultHeaders('x-auth-token', Buffer.from('admin:admin').toString('base64'));

async function createProject(id, name) {
  await pactum.spec()
    .post('/api/flow/v1/projects')
    .withJson({
      "id": id || "team_login-service",
      "name": name || "[Team] login-service"
    })
    .expectStatus(200);
}

async function deleteProject() {
  await pactum.spec()
    .delete('/api/flow/v1/projects/{id}')
    .withPathParams('id', 'team_login-service')
    .expectStatus(200);
}

async function createAnalysis(projectId, version, storeAnalysisId) {
  await pactum.spec()
    .post('/api/flow/v1/analyses')
    .withJson({
      "projectId": projectId || "team_login-service",
      "branch": "main",
      "version": version || "1.0.1"
    })
    .expectStatus(200)
    .stores(storeAnalysisId || 'AnalysisId', '_id');
}

async function deleteAnalysis() {
  await pactum.spec()
    .delete('/api/flow/v1/analyses/{id}')
    .withPathParams('id', '$S{AnalysisId}')
    .expectStatus(200);
}

async function createFlow(name, analysisId, options = {}) {
  const request = options.request || {
    "method": "GET",
    "path": "/api/path"
  };
  const response = options.response || {
    "statusCode": 200
  };
  await pactum.spec()
    .post('/api/flow/v1/flows')
    .withJson([
      {
        "analysisId": analysisId ? `$S{${analysisId}}` : "$S{AnalysisId}",
        "name": name || "flow-name-1",
        request,
        response
      }
    ])
    .expectStatus(200)
    .stores('FlowId', '[0]._id');
}

async function createInteraction(provider, flow, analysisId, storeInteractionId) {
  await pactum.spec()
    .post('/api/flow/v1/interactions')
    .withJson([
      {
        "analysisId": analysisId ? `$S{${analysisId}}` : "$S{AnalysisId}",
        "provider": provider || "provider-id",
        "flow": flow || "flow-name-1",
        "request": {
          "method": "GET",
          "path": "/api/path"
        },
        "response": {
          "statusCode": 200
        }
      }
    ])
    .expectStatus(200)
    .stores(storeInteractionId || 'InteractionId', '[0]._id');
}

async function processAnalysis(analysisId) {
  const id = analysisId ? `$S{${analysisId}}` : "$S{AnalysisId}";
  await pactum.spec()
    .post('/api/flow/v1/process/analysis')
    .withJson({
      "id": id,
    })
    .expectStatus(202);
  await pactum.spec()
    .get('/api/flow/v1/analyses/{analysisId}')
    .withPathParams('analysisId', id)
    .expectJsonLike({
      "processed": true
    })
    .retry(10, 200);
  // wait for compatibility results to process
  await pactum.sleep(50);
}

async function saveProjectInEnvironment(environment, projectId, version) {
  await pactum.spec()
    .post('/api/flow/v1/environments')
    .withJson({
      projectId,
      version,
      environment
    });
}

async function deleteAllProjects() {
  const ids = await pactum.spec()
  .get('/api/flow/v1/projects')
  .returns('[*]._id').toss();
for (let i = 0; i < ids.length; i++) {
  await pactum.spec()
    .delete('/api/flow/v1/projects/{id}')
    .withPathParams('id', ids[i]);
}
}

async function deleteAllEnvironments() {
  const environments = await pactum.spec()
    .get('/api/flow/v1/environments')
    .returns('[*]._id').toss();
  for (let i = 0; i < environments.length; i++) {
    await pactum.spec()
      .delete('/api/flow/v1/projects/{id}')
      .withPathParams('id', environments[i]);
  }
}

async function clean() {
  await deleteAllProjects();
  await deleteAllEnvironments();
  await Compatibility.deleteMany();
}

module.exports = {
  createProject,
  deleteProject,
  createAnalysis,
  deleteAnalysis,
  createFlow,
  createInteraction,
  processAnalysis,
  saveProjectInEnvironment,
  clean,
};