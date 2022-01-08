const pactum = require('pactum');
const { like } = require('pactum-matchers');
const db = require('../helpers/db');

describe('Environment', () => {

  before(async () => {
    await db.clean();
  });

  it('get environments should be empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/environments')
      .expectStatus(200)
      .expectJson([]);
  });

  it('get environments with invalid env id', async () => {
    await pactum.spec()
      .get('/api/flow/v1/environments/some')
      .expectStatus(200)
      .expectJson([]);
  });

  describe('single project with default env', () => {

    before(async () => {
      await db.clean();
      await db.createProject('p-id-1', 'p-name-1');
      await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
      await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
      await db.processAnalysis('p-id-1-a-id-1');
    });

    it('get environments should have latest with project one', async () => {
      await pactum.spec()
        .get('/api/flow/v1/environments')
        .expectStatus(200)
        .expectJsonMatchStrict([
          {
            "_id": like("61d9aa2dfe7d05844ee3a97e"),
            "name": "latest",
            "projectId": "p-id-1",
            "__v": 0,
            "analysisId": like("61d9aa2dfe7d05844ee3a97e"),
            "publishedAt": like("2022-01-08T15:13:49.730Z"),
            "version": "1.0.1"
          }
        ]);
    });

  });

  describe('add new env', () => {

    before(async () => {
      await db.clean();
      await db.createProject('p-id-1', 'p-name-1');
      await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
      await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
      await db.processAnalysis('p-id-1-a-id-1');
      await pactum.spec()
        .post('/api/flow/v1/environments')
        .withJson({
          projectId: 'p-id-1',
          version: '1.0.1',
          environment: 'dev'
        })
        .expectStatus(200);
    });

    it('get both latest and dev environments', async () => {
      await pactum.spec()
        .get('/api/flow/v1/environments')
        .expectStatus(200)
        .expectJsonMatchStrict([
          {
            "_id": like("61d9aa2dfe7d05844ee3a97e"),
            "name": "latest",
            "projectId": "p-id-1",
            "__v": 0,
            "analysisId": like("61d9aa2dfe7d05844ee3a97e"),
            "publishedAt": like("2022-01-08T15:13:49.730Z"),
            "version": "1.0.1"
          },
          {
            "_id": like("61d9aa2dfe7d05844ee3a97e"),
            "name": "dev",
            "projectId": "p-id-1",
            "__v": 0,
            "analysisId": like("61d9aa2dfe7d05844ee3a97e"),
            "publishedAt": like("2022-01-08T15:13:49.730Z"),
            "version": "1.0.1"
          }
        ]);
    });

    it('get dev environments', async () => {
      await pactum.spec()
        .get('/api/flow/v1/environments/dev')
        .expectStatus(200)
        .expectJsonMatchStrict([
          {
            "_id": like("61d9aa2dfe7d05844ee3a97e"),
            "name": "dev",
            "projectId": "p-id-1",
            "__v": 0,
            "analysisId": like("61d9aa2dfe7d05844ee3a97e"),
            "publishedAt": like("2022-01-08T15:13:49.730Z"),
            "version": "1.0.1"
          }
        ]);
    });

    it('delete dev environments', async () => {
      await pactum.spec()
        .delete('/api/flow/v1/environments/dev')
        .expectStatus(200)
        .expectJson({
          "n": 1,
          "ok": 1,
          "deletedCount": 1
        });
    });

    it('delete non existent environments', async () => {
      await pactum.spec()
        .delete('/api/flow/v1/environments/some')
        .expectStatus(200)
        .expectJson({
          "n": 0,
          "ok": 1,
          "deletedCount": 0
        });
    });

  });

  after(async () => {
    await db.clean();
  });

});