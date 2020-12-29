const pactum = require('pactum');
const { like } = require('pactum-matchers');
const { clean } = require('../helpers/db');

describe('POST /api/flow/v1/analyses', () => {

  before(async () => {
    await clean();
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
  });

  it('create a new analysis', async () => {
    await pactum.flow('create a new analysis')
      .post('/api/flow/v1/analyses')
      .withJson({
        "projectId": "team_login-service",
        "branch": "main",
        "version": "1.0.1"
      })
      .expectStatus(200);
  });

  it('create a new analysis with existing version', async () => {
    await pactum.flow('create a new analysis with existing version')
      .post('/api/flow/v1/analyses')
      .withJson({
        "projectId": "team_login-service",
        "branch": "main",
        "version": "1.0.1"
      })
      .expectStatus(400);
  });

  after(async () => {
    await clean();
  });

});

describe('GET /api/flow/v1/analyses', () => {

  before(async () => {
    await clean();
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
    await pactum.spec()
      .post('/api/flow/v1/analyses')
      .withJson({
        "projectId": "team_login-service",
        "branch": "main",
        "version": "1.0.1"
      })
      .expectStatus(200);
  });

  it('get analysis', async () => {
    await pactum.flow('get analysis')
      .get('/api/flow/v1/analyses')
      .withQueryParams('projectId', 'team_login-service')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "branch": "main",
          "version": "1.0.1",
          "processed": false,
          "_id": like("5fe9f0896b7cdd2938643fa8"),
          "projectId": "team_login-service",
          "createdAt": like("2020-12-28T14:49:45.842Z"),
          "__v": 0
        }
      ]);
  });

  it('get analysis for a non-existing project', async () => {
    await pactum.flow('get analysis for a non-existing project')
      .get('/api/flow/v1/analyses')
      .withQueryParams('projectId', 'invalid-project')
      .expectStatus(200)
      .expectJson([]);
  });

  after(async () => {
    await clean();
  });

});

describe('GET /api/flow/v1/analyses/{id}', () => {

  before(async () => {
    await clean();
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
    await pactum.spec()
      .post('/api/flow/v1/analyses')
      .withJson({
        "projectId": "team_login-service",
        "branch": "main",
        "version": "1.0.1"
      })
      .expectStatus(200)
      .stores('AnalysisId', '_id');
  });

  it('get an analysis by id', async () => {
    await pactum.flow('get an analysis by id')
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{AnalysisId}')
      .expectStatus(200)
      .expectJsonMatch({
        "branch": "main",
        "version": "1.0.1",
        "processed": false,
        "_id": like("5fe9f0896b7cdd2938643fa8"),
        "projectId": "team_login-service",
        "createdAt": like("2020-12-28T14:49:45.842Z"),
        "__v": 0
      });
  });

  it('get a non-existing analysis', async () => {
    await pactum.flow('get a non-existing analysis')
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '507f191e810c19729de860ea')
      .expectStatus(404);
  });

  afterEach(async () => {
    await clean();
  });

});

describe('DELETE /api/flow/v1/analyses/{id}', () => {

  before(async () => {
    await clean();
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
    await pactum.spec()
      .post('/api/flow/v1/analyses')
      .withJson({
        "projectId": "team_login-service",
        "branch": "main",
        "version": "1.0.1"
      })
      .expectStatus(200)
      .stores('AnalysisId', '_id');
  });

  it('delete an analysis by id', async () => {
    await pactum.flow('delete an analysis by id')
      .delete('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{AnalysisId}')
      .expectStatus(200);
  });

  it('delete a non-existing analysis', async () => {
    await pactum.flow('delete a non-existing analysis')
      .delete('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '507f191e810c19729de860ea')
      .expectStatus(404);
  });

  afterEach(async () => {
    await clean();
  });

});