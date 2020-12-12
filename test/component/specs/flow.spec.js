const pactum = require('pactum');
const { like } = pactum.matchers;

describe('Flow - create, get & delete', () => {

  before(async () => {
    this.flowId = '';
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service",
      })
      .expectStatus(200)
      .returns('_id');
    this.analysisId = await pactum.spec()
      .post('/api/flow/v1/analysis')
      .withJson({
        "projectId": "team_login-service",
        "branch": "main",
        "version": "1.0.2",
      })
      .expectStatus(200)
      .returns('_id');
  });

  it('create flow', async () => {
    this.flowId = await pactum.spec()
      .name('create flow')
      .post('/api/flow/v1/flows')
      .withJson({
        "name": "some flow name",
        "projectId": "team_login-service",
        "analysisId": this.analysisId,
        "request": {
          "method": "GET",
          "path": "/api/some/operation"
        },
        "response": {
          "statusCode": 200
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        "projectId": "team_login-service",
        "analysisId": this.analysisId
      })
      .expectJsonSnapshot({
        "_id": like('5fcc58fa26bcf83298099dd5'),
        "projectId": like('5fcc58fa26bcf83298099dd5'),
        "analysisId": like('5fcc58fa26bcf83298099dd5'),
        "createdAt": like('2020-12-06T04:37:08.165Z'),
        "request": {
          "_id": like('5fce3c6fdd765f04287cd483'),
        },
        "response": {
          "_id": like('5fce3c6fdd765f04287cd484'),
        }
      })
      .returns('_id');
  });

  it('get flow by id', async () => {
    await pactum.spec()
      .name('get flow')
      .get('/api/flow/v1/flows/{id}')
      .withPathParams('id', this.flowId)
      .expectStatus(200)
      .expectJsonLike({
        "_id": this.flowId,
        "projectId": "team_login-service",
        "analysisId": this.analysisId
      })
      .expectJsonSnapshot({
        "_id": like('5fcc58fa26bcf83298099dd5'),
        "projectId": like('5fcc58fa26bcf83298099dd5'),
        "analysisId": like('5fcc58fa26bcf83298099dd5'),
        "createdAt": like('2020-12-06T04:37:08.165Z'),
        "request": {
          "_id": like('5fce3c6fdd765f04287cd483'),
        },
        "response": {
          "_id": like('5fce3c6fdd765f04287cd484'),
        }
      });
  });

  it('get flow', async () => {
    await pactum.spec()
      .get('/api/flow/v1/flows')
      .expectStatus(200)
      .expectJsonLike([
        {
          "_id": this.flowId,
          "projectId": "team_login-service",
          "analysisId": this.analysisId,
          "request": {
            "method": "GET",
            "path": "/api/some/operation"
          },
          "response": {
            "statusCode": 200
          }
        }
      ]);
  });

  it('delete flow', async () => {
    await pactum.spec()
      .delete('/api/flow/v1/flows/{id}')
      .withPathParams('id', this.flowId)
      .expectStatus(200);
  });

  after(async () => {
    await pactum.spec()
      .delete('/api/flow/v1/projects/{id}')
      .withPathParams('id', "team_login-service")
      .expectStatus(200);
  });

});