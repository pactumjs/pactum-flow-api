const pactum = require('pactum');
const db = require('../helpers/db');

const { like } = require('pactum-matchers');

describe('Quality Gate Status - Consumer First', () => {

  before(async () => {
    await db.clean();
  });

  before('setup project two', async () => {
    await db.createProject('p-id-2', 'p-name-2');
    await db.createAnalysis('p-id-2', '2.0.1', 'p-id-2-a-id-1');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-2-a-id-1');
    await db.processAnalysis('p-id-2-a-id-1');
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  after(async () => {
    await db.clean();
  });

  it('qg status project 1 should be passed and includes project 2 as consumer', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "OK",
          "consumers": [
            {
              "name": "p-id-2",
              "version": "2.0.1",
              "status": "PASSED",
              "message": "",
              "exceptions": []
            }
          ],
          "providers": []
        }
      ]);
  });

  it('qg status project 2 should be passed and includes project 1 as provider', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-2')
      .withQueryParams('version', '2.0.1')
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "OK",
          "providers": [
            {
              "name": "p-id-1",
              "version": "1.0.1",
              "status": "PASSED",
              "message": "",
              "exceptions": []
            }
          ],
          "consumers": []
        }
      ]);
  });

  it('verify compatibility of project 1 with empty flows', async () => {
    await pactum.spec()
      .post('/api/flow/v1/compatibility/project/verify')
      .withJson({
        "projectId": "p-id-1",
        "environments": ["latest"],
        "flows": []
      })
      .expectStatus(200)
      .expectJsonMatch([
        {
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "status": "FAILED",
          "exceptions": [
            {
              "flow": "p-id-1-f-name-1",
              "error": "Flow Not Found"
            }
          ],
          "verifiedAt": like("2021-10-09T10:17:34.043Z")
        }
      ]);
  });

  it('verify qg status of project 1 with a missing flows', async () => {
    await pactum.spec()
      .post('/api/flow/v1/compatibility/project/verify')
      .withJson({
        "projectId": "p-id-1",
        "environments": ["latest"],
        "flows": [
          {
            "name": "invalid",
            "analysisId": "123456789012345678901234",
            "request": {
              "method": "DELETE",
              "path": "/invalid"
            },
            "response": {
              "statusCode": 204
            }
          }
        ]
      })
      .expectStatus(200)
      .expectJsonMatch([
        {
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "status": "FAILED",
          "exceptions": [
            {
              "flow": "p-id-1-f-name-1",
              "error": "Flow Not Found"
            }
          ],
          "verifiedAt": like("2021-10-09T10:17:34.043Z")
        }
      ]);
  });

});

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

  before('setup project four', async () => {
    const pid = 'p-id-4';
    const aid = `${pid}-a-id-1`
    await db.createProject(pid, 'p-name-4');
    await db.createAnalysis(pid, '4.0.1', aid);
    await db.processAnalysis(aid);
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
        "environments": ["latest"],
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
        "environments": ["test"],
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
        "environments": ["dev"],
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

  it('project 4 compatibility with new provider', async () => {
    const results = await pactum.spec()
      .post('/api/flow/v1/compatibility/project/verify')
      .withJson({
        "projectId": "p-id-4",
        "environments": ["latest"],
        "interactions": [
          {
            "analysisId": "abcdefghijklmnopqrstuvwx",
            "flow": "p-id-1-f-name-1",
            "provider": "p-id-1",
            "request": {
              "method": "GET",
              "path": "/api/path",
              "queryParams": {}
            },
            "response": {
              "statusCode": 200
            }
          }
        ]
      })
      .expectStatus(200)
      .expectJsonMatch([
        {
          "consumer": "p-id-4",
          "consumerVersion": "4.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "status": "PASSED",
          "exceptions": [],
          "verifiedAt": like("2021-10-09T10:17:34.043Z")
        }
      ])
      .returns('.');

    await pactum.spec()
      .post('/api/flow/v1/quality-gate/status/verify')
      .withJson({
        "projectId": "p-id-4",
        "environments": [],
        "compatibility_results": results
      })
      .expectStatus(200)
      .expectJson([
        {
          "environment": "latest",
          "status": "OK",
          "consumers": [],
          "providers": []
        }
      ]);
  });

});