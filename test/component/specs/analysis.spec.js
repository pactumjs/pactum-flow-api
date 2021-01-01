const pactum = require('pactum');
const { like } = require('pactum-matchers');
const db = require('../helpers/db');

describe('Analyses', () => {

  before(async () => {
    await db.clean();
    await db.createProject();
  });

  describe('POST /api/flow/v1/analyses', () => {

    it('create a new analysis', async () => {
      await pactum.flow('create a new analysis')
        .post('/api/flow/v1/analyses')
        .withJson({
          "projectId": "team_login-service",
          "branch": "main",
          "version": "1.0.1"
        })
        .expectStatus(200)
        .stores('AnalysisId', '_id');
      await db.deleteAnalysis();
    });

    it('create a new analysis with existing version', async () => {
      await pactum.spec()
        .post('/api/flow/v1/analyses')
        .withJson({
          "projectId": "team_login-service",
          "branch": "main",
          "version": "1.0.1"
        })
        .expectStatus(200)
        .stores('AnalysisId', '_id');
      await pactum.flow('create a new analysis with existing version')
        .post('/api/flow/v1/analyses')
        .withJson({
          "projectId": "team_login-service",
          "branch": "main",
          "version": "1.0.1"
        })
        .expectStatus(400);
      await db.deleteAnalysis();
    });

    it('create a new analysis for non-existing project', async () => {
      await pactum.flow('create a new analysis for non-existing project')
        .post('/api/flow/v1/analyses')
        .withJson({
          "projectId": "team_non-existing",
          "branch": "main",
          "version": "1.0.1"
        })
        .expectStatus(400);
    });

  });

  describe('GET /api/flow/v1/analyses', () => {

    before(async () => {
      await db.createAnalysis();
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
      await db.deleteAnalysis();
    });

  });

  describe('GET /api/flow/v1/analyses/{id}', () => {

    before(async () => {
      await db.createAnalysis();
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

    after(async () => {
      await db.deleteAnalysis();
    });

  });

  describe('DELETE /api/flow/v1/analyses/{id}', () => {

    it('delete an analysis by id', async () => {
      await db.createAnalysis();
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

  });

  after(async () => {
    await db.clean();
  });

});