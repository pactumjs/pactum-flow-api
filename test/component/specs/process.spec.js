const pactum = require('pactum');
const { like } = require('pactum-matchers');
const db = require('../helpers/db');

const { addRetryHandler } = pactum.handler;

addRetryHandler('till processed', (ctx) => {
  return !ctx.res.json.processed;
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
        .retry({ delay: 50, count: 5, strategy: 'till processed'})
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
      await db.createBasicFlow();
      await pactum.flow('process analysis with a flow')
        .post('/api/flow/v1/process/analysis')
        .withJson({
          "id": "$S{AnalysisId}",
        })
        .expectStatus(202);
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed'})
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
      await db.createBasicInteraction();
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
        .retry({ delay: 50, count: 5, strategy: 'till processed'})
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
      await db.createBasicFlow();
      await db.createBasicInteraction();
      await pactum.flow('process analysis')
        .post('/api/flow/v1/process/analysis')
        .withJson({
          "id": "$S{AnalysisId}",
        })
        .expectStatus(202);
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed'})
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
      await db.createBasicFlow();
      await db.createBasicInteraction();
      await db.processAnalysis();
      await pactum.sleep(50);
    });

    it('analysis with same flows & interactions', async () => {
      await db.createAnalysis(null, '1.0.2');
      await db.createBasicFlow();
      await db.createBasicInteraction();
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed'})
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
      await db.createBasicFlow();
      await db.createBasicFlow('flow-name-2');
      await db.createBasicInteraction();
      await db.createBasicInteraction(null, 'flow-name-2');
      await db.createBasicInteraction('provider-id-2', 'flow-name-3');
      await db.processAnalysis();
      await pactum.spec()
        .get('/api/flow/v1/analyses/{id}')
        .withPathParams('id', '$S{AnalysisId}')
        .retry({ delay: 50, count: 5, strategy: 'till processed'})
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
        .retry({ delay: 50, count: 5, strategy: 'till processed'})
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