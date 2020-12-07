const pactum = require('pactum');
const { like } = pactum.matchers;

describe('Flow - create, get & delete', () => {

  before(async () => {
    this.flowId = '';
    this.projectId = await pactum.spec()
      .post('/api/pactum/flow/v1/project')
      .withJson({
        "key": "team_login-service",
        "name": "[Team] login-service",
      })
      .expectStatus(200)
      .returns('_id');
    this.analysisId = await pactum.spec()
      .post('/api/pactum/flow/v1/analysis')
      .withJson({
        "projectId": this.projectId,
        "branch": "main",
        "version": "1.0.2",
      })
      .expectStatus(200)
      .returns('_id');
  });

  it('create flow', async () => {
    this.flowId = await pactum.spec()
      .name('create flow')
      .post('/api/pactum/flow/v1/flow')
      .withJson({
        "name": "some flow name",
        "projectId": this.projectId,
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
        "projectId": this.projectId,
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
      .get('/api/pactum/flow/v1/flow/{id}')
      .withPathParams('id', this.flowId)
      .expectStatus(200)
      .expectJsonLike({
        "_id": this.flowId,
        "projectId": this.projectId,
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
      .get('/api/pactum/flow/v1/flow')
      .expectStatus(200)
      .expectJsonLike([
        {
          "_id": this.flowId,
          "projectId": this.projectId,
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
      .delete('/api/pactum/flow/v1/flow/{id}')
      .withPathParams('id', this.flowId)
      .expectStatus(200);
  });

  after(async () => {
    await pactum.spec()
      .delete('/api/pactum/flow/v1/project/{id}')
      .withPathParams('id', this.projectId)
      .expectStatus(200);
  });

});