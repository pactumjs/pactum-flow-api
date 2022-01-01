const pactum = require('pactum');
const db = require('../helpers/db');

describe('Quality Gate', () => {

  before(async () => {
    await db.clean();
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  before('setup project two', async () => {
    await db.createProject('p-id-2', 'p-name-2');
    await db.createAnalysis('p-id-2', '2.0.1', 'p-id-2-a-id-1');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-2-a-id-1');
    await db.processAnalysis('p-id-2-a-id-1');
  });

  before('setup project three', async () => {
    await db.createProject('p-id-3', 'p-name-3');
    await db.createAnalysis('p-id-3', '3.0.1', 'p-id-3-a-id-1');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-3-a-id-1');
    await db.processAnalysis('p-id-3-a-id-1');
  });

  before('setup environments', async () => {
    await db.saveProjectInEnvironment('test', 'p-id-2', '2.0.1');
    await db.saveProjectInEnvironment('dev', 'p-id-3', '3.0.1');
    await db.saveProjectInEnvironment('dev', 'p-id-1', '1.0.1');
  });

  after(async () => {
    await db.clean();
  });

  it('project 1 should contain latest and dev env', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "OK",
          "consumers": [],
          "providers": []
        },
        {
          "environment": "dev",
          "status": "OK",
          "consumers": [],
          "providers": []
        }
      ]);
  });

  it('project 1 should pass for test env', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .withQueryParams('environment', 'test')
      .expectStatus(200)
      .expectJson([
        {
          "environment": "test",
          "status": "OK",
          "consumers": [],
          "providers": []
        }
      ]);
  });

  it('project 2 should contain latest and test', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-2')
      .withQueryParams('version', '2.0.1')
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "OK",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "1.0.1",
              "status": "PASSED",
              "message": "",
              "exceptions": []
            }
          ]
        },
        {
          "environment": "test",
          "status": "ERROR",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "",
              "status": "ERROR",
              "message": "Project Not Found",
              "exceptions": []
            }
          ]
        }
      ]);
  });

  it('project 2 should fail for dev env', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-2')
      .withQueryParams('version', '2.0.1')
      .withQueryParams('environment', 'dev')
      .expectStatus(200)
      .expectJson([
        {
          "environment": "dev",
          "status": "OK",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "1.0.1",
              "status": "PASSED",
              "message": "",
              "exceptions": []
            }
          ]
        }
      ]);
  });

  it('project 3 should contain latest and dev', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-3')
      .withQueryParams('version', '3.0.1')
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "OK",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "1.0.1",
              "status": "PASSED",
              "message": "",
              "exceptions": []
            }
          ]
        },
        {
          "environment": "dev",
          "status": "OK",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "1.0.1",
              "status": "PASSED",
              "message": "",
              "exceptions": []
            }
          ]
        }
      ]);
  });

  it('verification status of project 1 should be passed as it does not have any dependents', async () => {
    await pactum.spec()
      .post('/api/flow/v1/quality-gate/status/verify')
      .withJson({
        "projectId": "p-id-1",
        "environments": [],
        "compatibility_results": [
          {
            "consumer": "p-id-2",
            "consumerVersion": "2.0.1",
            "provider": "p-id-1",
            "providerVersion": "1.0.1",
            "exceptions": [],
            "status": "PASSED"
          }
        ]
      })
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "OK",
          "consumers": [],
          "providers": []
        },
        {
          "environment": "dev",
          "status": "OK",
          "consumers": [],
          "providers": []
        }
      ]);
  });

  it('should be fail with missing compatibility results and missing project', async () => {
    await pactum.spec()
      .post('/api/flow/v1/quality-gate/status/verify')
      .withJson({
        "projectId": "p-id-2",
        "environments": [],
        "compatibility_results": []
      })
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "ERROR",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "1.0.1",
              "status": "ERROR",
              "message": "Compatibility Results Not Found",
              "exceptions": []
            }
          ]
        },
        {
          "environment": "test",
          "status": "ERROR",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "",
              "status": "ERROR",
              "message": "Project Not Found",
              "exceptions": []
            }
          ]
        }
      ]);
  });

  it('should be fail with missing compatibility results', async () => {
    await pactum.spec()
      .post('/api/flow/v1/quality-gate/status/verify')
      .withJson({
        "projectId": "p-id-2",
        "environments": [ "latest" ],
        "compatibility_results": []
      })
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "ERROR",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "1.0.1",
              "status": "ERROR",
              "message": "Compatibility Results Not Found",
              "exceptions": []
            }
          ]
        }
      ]);
  });

  it('should be fail with missing project', async () => {
    await pactum.spec()
      .post('/api/flow/v1/quality-gate/status/verify')
      .withJson({
        "projectId": "p-id-2",
        "environments": [ "test" ],
        "compatibility_results": []
      })
      .expectStatus(200)
      .expectJson([
        {
          "environment": "test",
          "status": "ERROR",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "",
              "status": "ERROR",
              "message": "Project Not Found",
              "exceptions": []
            }
          ]
        }
      ]);
  });

  it('should be fail with missing compatibility results in a new environment', async () => {
    await pactum.spec()
      .post('/api/flow/v1/quality-gate/status/verify')
      .withJson({
        "projectId": "p-id-2",
        "environments": [ "dev" ],
        "compatibility_results": []
      })
      .expectStatus(200)
      .expectJson([
        {
          "environment": "dev",
          "status": "ERROR",
          "consumers": [],
          "providers": [
            {
              "name": "p-id-1",
              "version": "1.0.1",
              "status": "ERROR",
              "message": "Compatibility Results Not Found",
              "exceptions": []
            }
          ]
        }
      ]);
  });

});