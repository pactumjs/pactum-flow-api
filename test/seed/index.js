const pactum = require('pactum');
const { request } = pactum;

request.setBaseUrl('http://localhost:3000');

async function clean() {
  const ids = await pactum.spec()
    .get('/api/flow/v1/projects')
    .expectStatus(200)
    .returns('[*]._id');
  for (let i = 0; i < ids.length; i++) {
    await pactum.spec()
      .delete('/api/flow/v1/projects/{id}')
      .withPathParams('id', ids[i])
      .expectStatus(200);
  }
}

async function projects() {
  await pactum.spec()
    .post('/api/flow/v1/projects')
    .withJson({
      "id": "team_login-service",
      "name": "[Team] login-service",
    })
    .expectStatus(200);
  await pactum.spec()
    .post('/api/flow/v1/projects')
    .withJson({
      "id": "team_flow-service",
      "name": "[Team] flow-service",
    })
    .expectStatus(200);
}

async function analyses() {
  await pactum.spec()
    .post('/api/flow/v1/analyses')
    .withJson({
      "projectId": "team_login-service",
      "branch": "main",
      "version": "1.0.2",
    })
    .expectStatus(200)
    .stores('AID1', '_id');
}

async function interactions() {
  await pactum.spec()
    .post('/api/flow/v1/interactions')
    .withJson([
      {
        "analysisId": "$S{AID1}",
        "provider": "team_flow-service",
        "flow": "some flow name",
        "request": {},
        "response": {}
      }
    ])
    .expectStatus(200);
}

async function seed() {
  await clean();
  await projects();
  await analyses();
  await interactions();
}

seed().then().catch(err => console.log(err));