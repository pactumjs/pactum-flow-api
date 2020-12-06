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

  it('create a new flow', async () => {
    this.flowId = await pactum.spec()
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
      .expectJsonMatch({
        "_id": like('5fcc58fa26bcf83298099dd5'),
        "projectId": this.projectId,
        "analysisId": this.analysisId,
        "request": {
          "method": "GET",
          "path": "/api/some/operation"
        },
        "response": {
          "statusCode": 200
        },
        "createdAt": like('2020-12-06T04:37:08.165Z')
      })
      .returns('_id');
  });

  it('get flow by id', async () => {
    await pactum.spec()
      .get('/api/pactum/flow/v1/flow/{id}')
      .withPathParams('id', this.flowId)
      .expectStatus(200)
      .expectJsonMatch({
        "_id": this.flowId,
        "projectId": this.projectId,
        "analysisId": this.analysisId,
        "request": {
          "method": "GET",
          "path": "/api/some/operation"
        },
        "response": {
          "statusCode": 200
        },
        "createdAt": like('2020-12-06T04:37:08.165Z')
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

  it('delete an flow', async () => {
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
    await pactum.spec()
      .delete('/api/pactum/flow/v1/analysis/{id}')
      .withPathParams('id', this.analysisId)
      .expectStatus(200);
  });

});