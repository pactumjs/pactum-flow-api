const pactum = require('pactum');
const db = require('../helpers/db');

describe('Flows', () => {

  before(async () => {
    await db.clean();
    await db.createProject();
    await db.createAnalysis();
  });

  describe('/api/flow/v1/flows', () => {

    it('add & fetch a basic flow details', async () => {
      await pactum.flow('add a basic flow')
        .post('/api/flow/v1/flows')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "name": "flow-name-1",
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
        .stores('FlowId', '[0]._id');
      await pactum.flow('get a basic flow')
        .get('/api/flow/v1/flows/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "name": "flow-name-1",
          "info": "GET::/api/path::200",
          "projectId": "team_login-service",
        });
      await pactum.flow('get a basic flow request')
        .get('/api/flow/v1/requests/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "method": "GET",
          "path": "/api/path",
          "projectId": "team_login-service"
        });
      await pactum.flow('get a basic flow response')
        .get('/api/flow/v1/responses/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "statusCode": 200,
          "projectId": "team_login-service"
        });
    });

    it('add & fetch a flow with headers & body', async () => {
      await pactum.flow('add a flow with headers & body')
        .post('/api/flow/v1/flows')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "name": "flow-name-2",
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
        .stores('FlowId', '[0]._id');
      await pactum.flow('get a flow with headers & body')
        .get('/api/flow/v1/flows/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "name": "flow-name-2",
          "info": "POST::/api/path::200",
          "projectId": "team_login-service"
        });
      await pactum.flow('get a flow request with headers & body')
        .get('/api/flow/v1/requests/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
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
      await pactum.flow('get a flow response with headers & body')
        .get('/api/flow/v1/responses/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
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

    it('add a flow with query params & path params', async () => {
      await pactum.flow('add a flow with query params & path params')
        .post('/api/flow/v1/flows')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "name": "flow-name-3",
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
        .expectStatus(200)
        .stores('FlowId', '[0]._id');
      await pactum.flow('get a flow with query params & path params')
        .get('/api/flow/v1/flows/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "name": "flow-name-3",
          "info": "DELETE::/api/path/{id}::200",
          "projectId": "team_login-service",
        });
      await pactum.flow('get a flow request with query params & path params')
        .get('/api/flow/v1/requests/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "method": "DELETE",
          "path": "/api/path/{id}",
          "queryParams": {
            "count": "2"
          },
          "pathParams": {
            "id": "resource-id"
          },
          "projectId": "team_login-service"
        });
      await pactum.spec()
        .get('/api/flow/v1/responses/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "statusCode": 200,
          "body": {
            "message": "text"
          },
          "projectId": "team_login-service"
        });
    });

    it('add a flow with matching rules', async () => {
      await pactum.flow('add a flow with matching rules')
        .post('/api/flow/v1/flows')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "name": "flow-name-4",
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
        .expectStatus(200)
        .stores('FlowId', '[0]._id');
      await pactum.flow('get a flow with matching rules')
        .get('/api/flow/v1/flows/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "name": "flow-name-4",
          "info": "POST::/api/path::200",
          "projectId": "team_login-service",
        });
      await pactum.flow('get a flow request with matching rules')
        .get('/api/flow/v1/requests/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "method": "POST",
          "path": "/api/path",
          "body": {
            "message": "text"
          },
          "matchingRules": {
            "$.body.message": {
              "match": "type"
            }
          },
          "projectId": "team_login-service"
        });
      await pactum.flow('get a flow response with matching rules')
        .get('/api/flow/v1/responses/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "statusCode": 200,
          "body": {
            "message": "text"
          },
          "matchingRules": {
            "$.body.message": {
              "match": "type"
            }
          },
          "projectId": "team_login-service"
        });
    });

    it('add a flow with empty query, path, headers & body', async () => {
      await pactum.spec()
        .post('/api/flow/v1/flows')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "name": "flow-name-5",
            "request": {
              "method": "POST",
              "path": "/api/path/{id}",
              "pathParams": {},
              "queryParams": {},
              "headers": {},
              "body": []
            },
            "response": {
              "statusCode": 200,
              "headers": {},
              "body": {}
            }
          }
        ])
        .expectStatus(200)
        .stores('FlowId', '[0]._id');
      await pactum.spec()
        .get('/api/flow/v1/flows/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "name": "flow-name-5",
          "info": "POST::/api/path/{id}::200",
          "projectId": "team_login-service",
        });
      await pactum.spec()
        .get('/api/flow/v1/requests/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "method": "POST",
          "path": "/api/path/{id}",
          "body": [],
          "projectId": "team_login-service"
        });
      await pactum.spec()
        .get('/api/flow/v1/responses/{id}')
        .withPathParams('id', '$S{FlowId}')
        .expectStatus(200)
        .expectJson({
          "__v": 0,
          "_id": "$S{FlowId}",
          "analysisId": "$S{AnalysisId}",
          "statusCode": 200,
          "body": {},
          "projectId": "team_login-service"
        });
    });

    it('add duplicate flow details', async () => {
      await pactum.spec()
        .post('/api/flow/v1/flows')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "name": "flow-name",
            "request": {
              "method": "GET",
              "path": "/api/path"
            },
            "response": {
              "statusCode": 200
            }
          }
        ])
        .expectStatus(200);
      await pactum.flow('add a duplicate flow')
        .post('/api/flow/v1/flows')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "name": "flow-name",
            "request": {
              "method": "GET",
              "path": "/api/path"
            },
            "response": {
              "statusCode": 200
            }
          }
        ])
        .expectStatus(400);
    });

    it('add flow with invalid analysis id', async () => {
      await pactum.flow('add a flow with invalid analysis id')
        .post('/api/flow/v1/flows')
        .withJson([
          {
            "analysisId": "507f191e810c19729de860ea",
            "name": "flow-name",
            "request": {
              "method": "GET",
              "path": "/api/path"
            },
            "response": {
              "statusCode": 200
            }
          }
        ])
        .expectStatus(400);
    });

    // add a flow to already processed analysis

  });

  after(async () => {
    await db.clean();
  });

});