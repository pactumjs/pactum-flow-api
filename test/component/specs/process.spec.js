const pactum = require('pactum');
const { like } = require('pactum-matchers');
const db = require('../helpers/db');

const { addRetryHandler } = pactum.handler;

addRetryHandler('till processed', (ctx) => {
  return ctx.res.json.processed;
});

addRetryHandler('at least once compatibility result', (ctx) => {
  return ctx.res.json.length !== 0;
});

describe('Process new analysis', () => {

  before(async () => {
    await db.clean();
    await db.createProject();
  });

  describe('/api/flow/v1/process/analysis', () => {

    beforeEach(async () => {
      await db.createAnalysis();
    });

    it('process analysis without flows & interactions', async () => {
      await pactum.flow('process analysis without flows & interactions')
        .post('/api/flow/v1/process/analysis')
        .withJson({
          "id": "$S{AnalysisId}",
        })
        .expectStatus(202);
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200)
        .expectJsonMatch({
          "branch": "main",
          "version": "1.0.1",
          "processed": true,
          "_id": "$S{AnalysisId}",
          "projectId": "team_login-service",
          "createdAt": like("2020-12-28T14:49:45.842Z"),
          "interactions": 0,
          "flows": 0,
          "providers": 0,
          "consumers": 0,
          "__v": 0
        });
      await pactum.flow('get empty analyses metrics')
        .get('/api/flow/v1/metrics/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .expectStatus(200)
        .expectJsonMatch({
          "_id": "$S{AnalysisId}",
          "projectId": 'team_login-service',
          "consumers": {
            "all": [],
            "new": [],
            "removed": []
          },
          "flows": {
            "all": [],
            "new": [],
            "removed": []
          },
          "interactions": {
            "all": [],
            "new": [],
            "removed": []
          },
          "providers": {
            "all": [],
            "new": [],
            "removed": []
          }
        });
      await pactum.flow('get environments')
        .get('/api/flow/v1/environments')
        .expectStatus(200)
        .expectJson([
          {
            "__v": 0,
            "_id": "latest",
            "projects": {
              "team_login-service": "$S{AnalysisId}"
            }
          }
        ]);
    });

    it('process analysis with a flow', async () => {
      await db.createFlow();
      await pactum.flow('process analysis with a flow')
        .post('/api/flow/v1/process/analysis')
        .withJson({
          "id": "$S{AnalysisId}",
        })
        .expectStatus(202);
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200)
        .expectJsonMatch({
          "branch": "main",
          "version": "1.0.1",
          "processed": true,
          "_id": "$S{AnalysisId}",
          "projectId": "team_login-service",
          "createdAt": like("2020-12-28T14:49:45.842Z"),
          "interactions": 0,
          "flows": 1,
          "providers": 0,
          "consumers": 0,
          "__v": 0
        });
      await pactum.flow('get analyses metrics with a new flow')
        .get('/api/flow/v1/metrics/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .expectStatus(200)
        .expectJsonMatch({
          "_id": "$S{AnalysisId}",
          "projectId": 'team_login-service',
          "consumers": {
            "all": [],
            "new": [],
            "removed": []
          },
          "flows": {
            "all": ['$S{FlowId}'],
            "new": ['$S{FlowId}'],
            "removed": []
          },
          "interactions": {
            "all": [],
            "new": [],
            "removed": []
          },
          "providers": {
            "all": [],
            "new": [],
            "removed": []
          }
        });
    });

    it('process analysis with a interaction', async () => {
      await db.createInteraction();
      await pactum.flow('process analysis with a interaction')
        .post('/api/flow/v1/process/analysis')
        .withJson({
          "id": "$S{AnalysisId}",
        })
        .expectStatus(202);
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .expectStatus(200)
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectJsonMatch({
          "branch": "main",
          "version": "1.0.1",
          "processed": true,
          "_id": "$S{AnalysisId}",
          "projectId": "team_login-service",
          "createdAt": like("2020-12-28T14:49:45.842Z"),
          "interactions": 1,
          "flows": 0,
          "providers": 1,
          "consumers": 0,
          "__v": 0
        });
      await pactum.flow('get analyses metrics with a new interaction')
        .get('/api/flow/v1/metrics/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .expectStatus(200)
        .expectJsonMatch({
          "_id": "$S{AnalysisId}",
          "projectId": 'team_login-service',
          "consumers": {
            "all": [],
            "new": [],
            "removed": []
          },
          "flows": {
            "all": [],
            "new": [],
            "removed": []
          },
          "interactions": {
            "all": ['$S{InteractionId}'],
            "new": ['$S{InteractionId}'],
            "removed": []
          },
          "providers": {
            "all": ['provider-id'],
            "new": ['provider-id'],
            "removed": []
          }
        });
    });

    it('process analysis', async () => {
      await db.createFlow();
      await db.createInteraction();
      await pactum.flow('process analysis')
        .post('/api/flow/v1/process/analysis')
        .withJson({
          "id": "$S{AnalysisId}",
        })
        .expectStatus(202);
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await pactum.flow('get analyses metrics')
        .get('/api/flow/v1/metrics/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .expectStatus(200)
        .expectJsonMatch({
          "_id": "$S{AnalysisId}",
          "projectId": 'team_login-service',
          "consumers": {
            "all": [],
            "new": [],
            "removed": []
          },
          "flows": {
            "all": ['$S{FlowId}'],
            "new": ['$S{FlowId}'],
            "removed": []
          },
          "interactions": {
            "all": ['$S{InteractionId}'],
            "new": ['$S{InteractionId}'],
            "removed": []
          },
          "providers": {
            "all": ['provider-id'],
            "new": ['provider-id'],
            "removed": []
          }
        });
    });

    afterEach(async () => {
      await db.deleteAnalysis();
    });

  });

  after(async () => {
    await db.clean();
  });

});

describe('Process analysis with history', () => {

  before(async () => {
    await db.clean();
  });

  describe('/api/flow/v1/process/analysis', () => {

    beforeEach(async () => {
      await db.createProject();
      await db.createAnalysis();
      await db.createFlow();
      await db.createInteraction();
      await db.processAnalysis();
      await pactum.sleep(50);
    });

    it('analysis with same flows & interactions', async () => {
      await db.createAnalysis(null, '1.0.2');
      await db.createFlow();
      await db.createInteraction();
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await pactum.spec()
        .get('/api/flow/v1/metrics/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .expectStatus(200)
        .expectJsonMatch({
          "_id": "$S{AnalysisId}",
          "projectId": 'team_login-service',
          "consumers": {
            "all": [],
            "new": [],
            "removed": []
          },
          "flows": {
            "all": ['$S{FlowId}'],
            "new": [],
            "removed": []
          },
          "interactions": {
            "all": ['$S{InteractionId}'],
            "new": [],
            "removed": []
          },
          "providers": {
            "all": ['provider-id'],
            "new": [],
            "removed": []
          }
        });
    });

    it('analysis with new flows & interactions', async () => {
      await db.createAnalysis(null, '1.0.2');
      await db.createFlow();
      await db.createFlow('flow-name-2');
      await db.createInteraction();
      await db.createInteraction(null, 'flow-name-2');
      await db.createInteraction('provider-id-2', 'flow-name-3');
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await pactum.spec()
        .get('/api/flow/v1/metrics/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .expectStatus(200)
        .expectJsonMatch({
          "_id": "$S{AnalysisId}",
          "projectId": 'team_login-service',
          "consumers": {
            "all": [],
            "new": [],
            "removed": []
          },
          "flows": {
            "all": [like('id'), '$S{FlowId}'],
            "new": ['$S{FlowId}'],
            "removed": []
          },
          "interactions": {
            "all": [like('id'), like('id'), '$S{InteractionId}'],
            "new": [like('id'), '$S{InteractionId}'],
            "removed": []
          },
          "providers": {
            "all": ['provider-id', 'provider-id-2'],
            "new": ['provider-id-2'],
            "removed": []
          }
        });
    });

    it('analysis with removed flows & interactions', async () => {
      await db.createAnalysis(null, '1.0.2');
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await pactum.spec()
        .get('/api/flow/v1/metrics/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .expectStatus(200)
        .expectJsonMatch({
          "_id": "$S{AnalysisId}",
          "projectId": 'team_login-service',
          "consumers": {
            "all": [],
            "new": [],
            "removed": []
          },
          "flows": {
            "all": [],
            "new": [],
            "removed": ['$S{FlowId}']
          },
          "interactions": {
            "all": [],
            "new": [],
            "removed": ['$S{InteractionId}']
          },
          "providers": {
            "all": [],
            "new": [],
            "removed": ['provider-id']
          }
        });
    });

    afterEach(async () => {
      await db.deleteProject();
    });

  });

  after(async () => {
    await db.clean();
  });

});

describe('Process analysis with valid providers', () => {

  before(async () => {
    await db.clean();
    await db.createProject();
    await db.createProject('team_process-service', '[Team] process-service');
  });

  describe('/api/flow/v1/process/analysis', () => {

    it('provider verification passed', async () => {
      await db.createAnalysis();
      await db.createFlow();
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await db.createAnalysis('team_process-service', '2.0.1');
      await db.createInteraction('team_login-service');
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await pactum.flow('get passed compatibility results filtered by project and version')
        .get('/api/flow/v1/compatibility/project')
        .withQueryParams('projectId', 'team_process-service')
        .withQueryParams('version', '2.0.1')
        .retry({ delay: 50, count: 5, strategy: 'at least once compatibility result' })
        .expectJsonMatch([
          {
            "_id": like("60276cce979cdc30107d3f93"),
            "consumer": "team_process-service",
            "consumerVersion": "2.0.1",
            "provider": "team_login-service",
            "providerVersion": "1.0.1",
            "__v": 0,
            "exceptions": [],
            "status": "PASSED",
            "verifiedAt": like("2021-02-13T07:43:05.615Z")
          }
        ]);
    });

    it('provider verification failed at request', async () => {
      await db.createAnalysis('team_login-service', '1.0.2');
      await db.createFlow();
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await db.createAnalysis('team_process-service', '2.0.2');
      await pactum.spec()
        .post('/api/flow/v1/interactions')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "provider": "team_login-service",
            "flow": "flow-name-1",
            "request": {
              "method": "GET",
              "path": "/api/path",
              "queryParams": {
                "key": "value"
              }
            },
            "response": {
              "statusCode": 200
            }
          }
        ])
        .expectStatus(200);
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await pactum.flow('get failed compatibility results filtered by project and version')
        .get('/api/flow/v1/compatibility/project')
        .withQueryParams('projectId', 'team_process-service')
        .withQueryParams('version', '2.0.2')
        .retry({ delay: 50, count: 5, strategy: 'at least once compatibility result' })
        .expectJsonMatch([
          {
            "_id": like("60276cce979cdc30107d3f93"),
            "consumer": "team_process-service",
            "consumerVersion": "2.0.2",
            "provider": "team_login-service",
            "providerVersion": "1.0.2",
            "__v": 0,
            "exceptions": [
              {
                "_id": like("602787e532db9d2380036cc8"),
                "flow": "flow-name-1",
                "error": "Failed to match request - Query Params Not Found"
              }
            ],
            "status": "FAILED",
            "verifiedAt": like("2021-02-13T07:43:05.615Z")
          }
        ]);
    });

    it('provider verification failed at response', async () => {
      await db.createAnalysis('team_login-service', '1.0.3');
      await db.createFlow();
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await db.createAnalysis('team_process-service', '2.0.3');
      await pactum.spec()
        .post('/api/flow/v1/interactions')
        .withJson([
          {
            "analysisId": "$S{AnalysisId}",
            "provider": "team_login-service",
            "flow": "flow-name-1",
            "request": {
              "method": "GET",
              "path": "/api/path"
            },
            "response": {
              "statusCode": 200,
              "body": {
                "key": "value"
              }
            }
          }
        ])
        .expectStatus(200);
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed' })
        .expectStatus(200);
      await pactum.spec()
        .get('/api/flow/v1/compatibility/project')
        .withQueryParams('projectId', 'team_process-service')
        .withQueryParams('version', '2.0.3')
        .retry({ delay: 50, count: 5, strategy: 'at least once compatibility result' })
        .expectJsonMatch([
          {
            "_id": like("60276cce979cdc30107d3f93"),
            "consumer": "team_process-service",
            "consumerVersion": "2.0.3",
            "provider": "team_login-service",
            "providerVersion": "1.0.3",
            "__v": 0,
            "exceptions": [
              {
                "_id": like("602787e532db9d2380036cc8"),
                "flow": "flow-name-1",
                "error": "Failed to match response - Body Not Found"
              }
            ],
            "status": "FAILED",
            "verifiedAt": like("2021-02-13T07:43:05.615Z")
          }
        ]);
    });

  });

  after(async () => {
    await db.clean();
  });

});