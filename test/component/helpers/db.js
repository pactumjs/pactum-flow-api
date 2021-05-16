const pactum = require('pactum');
const { request } = require('pactum');
const Environment = require('../../../src/api/models/environment.model');
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

async function createBasicFlow(name, analysisId, storeFlowId) {
  await pactum.spec()
    .post('/api/flow/v1/flows')
    .withJson([
      {
        "analysisId": analysisId ? `$S{${analysisId}}` : "$S{AnalysisId}",
        "name": name || "flow-name-1",
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
    .stores(storeFlowId || 'FlowId', '[0]._id');
}

async function createBasicInteraction(provider, flow, analysisId, storeInteractionId) {
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
    .retry(5, 500);
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
  await Compatibility.deleteMany();
}

module.exports = {
  createProject,
  deleteProject,
  createAnalysis,
  deleteAnalysis,
  createBasicFlow,
  createBasicInteraction,
  processAnalysis,
  clean,
};