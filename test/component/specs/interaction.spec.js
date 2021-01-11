const pactum = require('pactum');
const db = require('../helpers/db');

describe('Interactions', () => {

  before(async () => {
    await db.clean();
    await db.createProject();
    await db.createAnalysis();
  });

  describe('/api/flow/v1/interactions', () => {

    it('add & fetch a basic interaction details', async () => {
      await pactum.flow('add a basic interaction')
        .post('/api/flow/v1/interactions')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "provider": "provider-id",
            "flow": "flow-name-1",
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
        .stores('InteractionId', '[0]._id');
      await pactum.flow('get a basic interaction')
        .get('/api/flow/v1/interactions/{id}')
        .withPathParams('id', '$S{InteractionId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{InteractionId}",
          "analysisId": "$S{AnalysisId}",
          "flow": "flow-name-1",
          "info": "GET::/api/path::200",
          "projectId": "team_login-service",
          "provider": "provider-id"
        });
      await pactum.flow('get a basic interaction request')
        .get('/api/flow/v1/requests/{id}')
        .withPathParams('id', '$S{InteractionId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{InteractionId}",
          "analysisId": "$S{AnalysisId}",
          "method": "GET",
          "path": "/api/path",
          "projectId": "team_login-service"
        });
      await pactum.flow('get a basic interaction response')
        .get('/api/flow/v1/responses/{id}')
        .withPathParams('id', '$S{InteractionId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{InteractionId}",
          "analysisId": "$S{AnalysisId}",
          "statusCode": 200,
          "projectId": "team_login-service"
        });
    });

    it('add & fetch a interaction with headers & body', async () => {
      await pactum.flow('add a interaction with headers & body')
        .post('/api/flow/v1/interactions')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "provider": "provider-id",
            "flow": "flow-name-2",
            "request": {
              "method": "POST",
              "path": "/api/path",
              "headers": {
                "x-token": "abc"
              },
              "body": {
                "message": "text"
              }
            },
            "response": {
              "statusCode": 200,
              "headers": {
                "x-token": "xyz"
              },
              "body": {
                "message": "text"
              }
            }
          }
        ])
        .expectStatus(200)
        .stores('InteractionId', '[0]._id');
      await pactum.flow('get a interaction with headers & body')
        .get('/api/flow/v1/interactions/{id}')
        .withPathParams('id', '$S{InteractionId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{InteractionId}",
          "analysisId": "$S{AnalysisId}",
          "flow": "flow-name-2",
          "info": "POST::/api/path::200",
          "projectId": "team_login-service",
          "provider": "provider-id"
        });
      await pactum.flow('get a interaction request with headers & body')
        .get('/api/flow/v1/requests/{id}')
        .withPathParams('id', '$S{InteractionId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{InteractionId}",
          "analysisId": "$S{AnalysisId}",
          "method": "POST",
          "path": "/api/path",
          "body": {
            "message": "text"
          },
          "headers": {
            "x-token": "abc"
          },
          "projectId": "team_login-service"
        });
      await pactum.flow('get a interaction response with headers & body')
        .get('/api/flow/v1/responses/{id}')
        .withPathParams('id', '$S{InteractionId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{InteractionId}",
          "analysisId": "$S{AnalysisId}",
          "statusCode": 200,
          "body": {
            "message": "text"
          },
          "headers": {
            "x-token": "xyz"
          },
          "projectId": "team_login-service"
        });
    });

    it('add a interaction with query params & path params', async () => {
      await pactum.flow('add a interaction with query params & path params')
        .post('/api/flow/v1/interactions')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "provider": "provider-id",
            "flow": "flow-name-3",
            "request": {
              "method": "DELETE",
              "path": "/api/path/{id}",
              "pathParams": {
                "id": "resource-id"
              },
              "queryParams": {
                "count": "2"
              }
            },
            "response": {
              "statusCode": 200,
              "body": {
                "message": "text"
              }
            }
          }
        ])
        .expectStatus(200);
    });

    it('add a interaction with matching rules', async () => {
      await pactum.flow('add a interaction with matching rules')
        .post('/api/flow/v1/interactions')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "provider": "provider-id",
            "flow": "flow-name-4",
            "request": {
              "method": "POST",
              "path": "/api/path",
              "matchingRules": {
                "$.body.message": {
                  "match": "type"
                }
              },
              "body": {
                "message": "text"
              }
            },
            "response": {
              "statusCode": 200,
              "matchingRules": {
                "$.body.message": {
                  "match": "type"
                }
              },
              "body": {
                "message": "text"
              }
            }
          }
        ])
        .expectStatus(200);
    });

    // add a duplicate interaction
    // add a interaction with invalid analysis id
    // add a interaction to already processed analysis

  });

  after(async () => {
    await db.clean();
  });

});