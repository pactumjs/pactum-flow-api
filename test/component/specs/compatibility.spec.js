const pactum = require('pactum');
const db = require('../helpers/db');
const { like } = require('pactum-matchers');

describe('Compatibility', () => {

  it('get compatibility results of invalid project should return empty array', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-100')
      .withQueryParams('version', '1.0.2')
      .expectStatus(200)
      .expectJson([]);
  });

});

describe('Compatibility - One Project with no consumers or providers', () => {

  before(async () => {
    await db.clean();
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  it('compatibility results of project one should be empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .expectStatus(200)
      .expectJson([]);
  });

  it('quality gate status should be OK', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]);
  });

  it('quality gate status by env should be OK', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .withQueryParams('environment', 'latest')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]);
  });

  it('quality gate status by invalid env should fail', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .withQueryParams('environment', 'late')
      .expectStatus(400)
      .expectJson({
        error: 'Environment Not Found'
      });
  });

  after(async () => {
    await db.clean();
  });

});

describe('Compatibility - One Project with a provider which is not available', () => {

  before(async () => {
    await db.clean();
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  it('compatibility results of project one should be empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .expectStatus(200)
      .expectJson([]);
  });

  it('quality gate status should be ERROR', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              exceptions: [],
              message: 'Project Not Found',
              name: 'p-id-2',
              status: 'ERROR',
              version: ''
            }
          ],
          status: 'ERROR'
        }
      ]);
  });

  after(async () => {
    await db.clean();
  });

});

describe('Compatibility - Multiple Projects - Happy Paths', () => {

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

  it('compatibility results of project one should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "__v": 0,
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        }
      ]);
  });

  it('compatibility results of project two should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-2')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "__v": 0,
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        }
      ]);
  });

  it('quality gate status of project one should be OK & consumers should be empty', async () => {
    // consumers are empty because at the time of analyzing project one, there is no project two
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]);
  });

  it('quality gate status of project two should be OK', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-2')
      .withQueryParams('version', '2.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              "exceptions": [],
              "message": "",
              "name": "p-id-1",
              "status": "PASSED",
              "version": "1.0.1"
            }
          ],
          status: 'OK'
        }
      ]);
  });

  it('get compatibility results of project by version should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .expectStatus(200)
      .expectJsonMatch([{
        "_id": like("60a0aec5331891b08cb8a0f6"),
        "consumer": "p-id-2",
        "consumerVersion": "2.0.1",
        "provider": "p-id-1",
        "providerVersion": "1.0.1",
        "__v": 0,
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2021-05-16T05:33:57.880Z")
      }]);
  });

  it('get compatibility results of project by invalid version should return empty array', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.2')
      .expectStatus(200)
      .expectJson([]);
  });

  it('run new analysis for project one', async () => {
    await db.createAnalysis('p-id-1', '1.0.2', 'p-id-1-a-id-2');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-2');
    await db.processAnalysis('p-id-1-a-id-2');
  });

  it('compatibility results of project one should contain both versions and should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "__v": 0,
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        },
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.2",
          "__v": 0,
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        }
      ]);
  });

  it('quality gate status of project one for version 1.0.2 should be OK & consumers should not be empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.2')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [
            {
              "name": "p-id-2",
              "version": "2.0.1",
              "status": "PASSED",
              "message": "",
              "exceptions": []
            }
          ],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]);
  });

  it('quality gate status of project one for version 1.0.1 should be OK & consumers should be empty', async () => {
    // consumers are empty because at the time of analyzing project one with version 1.0.1, there is no project two
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]);
  });

  it('quality gate status of project two should be OK and should contain latest version of project one in providers', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-2')
      .withQueryParams('version', '2.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              "exceptions": [],
              "message": "",
              "name": "p-id-1",
              "status": "PASSED",
              "version": "1.0.2"
            }
          ],
          status: 'OK'
        }
      ]);
  });

  it('setup project three', async () => {
    await db.createProject('p-id-3', 'p-name-2');
    await db.createAnalysis('p-id-3', '3.0.1', 'p-id-3-a-id-1');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-3-a-id-1');
    await db.processAnalysis('p-id-3-a-id-1');
  });

  it('compatibility results of project three should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-3')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-3",
          "consumerVersion": "3.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.2",
          "__v": 0,
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        }
      ]);
  });

  it('quality gate status of project three should be OK', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-3')
      .withQueryParams('version', '3.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              "exceptions": [],
              "message": "",
              "name": "p-id-1",
              "status": "PASSED",
              "version": "1.0.2"
            }
          ],
          status: 'OK'
        }
      ]);
  });

  after(async () => {
    await db.clean();
  });

});

describe('Compatibility - Multiple Projects - Sad Paths', () => {

  before(async () => {
    await db.clean();
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1', {
      request: {
        method: 'GET',
        path: '/api/path/v2'
      }
    });
    await db.processAnalysis('p-id-1-a-id-1');
  });

  before('setup project two', async () => {
    await db.createProject('p-id-2', 'p-name-2');
    await db.createAnalysis('p-id-2', '2.0.1', 'p-id-2-a-id-1');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-2-a-id-1');
    await db.processAnalysis('p-id-2-a-id-1');
  });

  it('compatibility results of project one should be failed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "__v": 0,
          "exceptions": [
            {
              "_id": like("60a8a320fe73ab47588ce8fd"),
              "flow": "p-id-1-f-name-1",
              "error": "Failed to match request path"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        }
      ]);
  });

  it('compatibility results of project two should be failed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-2')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "__v": 0,
          "exceptions": [
            {
              "_id": like("60a8a320fe73ab47588ce8fd"),
              "flow": "p-id-1-f-name-1",
              "error": "Failed to match request path"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        }
      ]);
  });

  it('quality gate status of project one should be OK & consumers should be empty', async () => {
    // consumers are empty because at the time of analyzing project one, there is no project two
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]);
  });

  it('quality gate status of project two should be ERROR', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-2')
      .withQueryParams('version', '2.0.1')
      .expectStatus(200)
      .expectJsonMatchStrict([
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              "exceptions": [
                {
                  "_id": like("60a8a320fe73ab47588ce8fd"),
                  "flow": "p-id-1-f-name-1",
                  "error": "Failed to match request path"
                }
              ],
              "message": "",
              "name": "p-id-1",
              "status": "FAILED",
              "version": "1.0.1"
            }
          ],
          status: 'ERROR'
        }
      ]);
  });

  it('run new analysis for project one with appropriate flow', async () => {
    await db.createAnalysis('p-id-1', '1.0.2', 'p-id-1-a-id-2');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-2');
    await db.processAnalysis('p-id-1-a-id-2');
  });

  it('second compatibility results of project one should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "__v": 0,
          "exceptions": [
            {
              "_id": like("60a8a320fe73ab47588ce8fd"),
              "flow": "p-id-1-f-name-1",
              "error": "Failed to match request path"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        },
        {
          "_id": like("60a8a518d7d1f819494cb6d5"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.2",
          "__v": 0,
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2021-05-22T06:30:48.722Z")
        }
      ]);
  });

  it('second compatibility results of project two should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-2')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a0aec5331891b08cb8a0f6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "__v": 0,
          "exceptions": [
            {
              "_id": like("60a8a320fe73ab47588ce8fd"),
              "flow": "p-id-1-f-name-1",
              "error": "Failed to match request path"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2021-05-16T05:33:57.880Z")
        },
        {
          "_id": like("60a8a646d7d1f819494cb8a0"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.2",
          "__v": 0,
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2021-05-22T06:35:50.911Z")
        }
      ]);
  });

  it('quality gate status of project one should be OK', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.2')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [
            {
              "name": "p-id-2",
              "version": "2.0.1",
              "status": "PASSED",
              "message": "",
              "exceptions": []
            }
          ],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]);
  });

  it('quality gate status of project two should be OK', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-2')
      .withQueryParams('version', '2.0.1')
      .expectStatus(200)
      .expectJsonMatchStrict([
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              "exceptions": [],
              "message": "",
              "name": "p-id-1",
              "status": "PASSED",
              "version": "1.0.2"
            }
          ],
          status: 'OK'
        }
      ]);
  });

  it('setup project three with invalid provider', async () => {
    await db.createProject('p-id-3', 'p-name-3');
    await db.createAnalysis('p-id-3', '3.0.1', 'p-id-3-a-id-1');
    await db.createInteraction('p-id-na', 'p-id-na-f-name-1', 'p-id-3-a-id-1');
    await db.processAnalysis('p-id-3-a-id-1');
  });

  it('compatibility results of project three should return empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-3')
      .expectStatus(200)
      .expectJsonMatch([]);
  });

  it('quality gate status of project three should be ERROR', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-3')
      .withQueryParams('version', '3.0.1')
      .expectStatus(200)
      .expectJson([
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              "exceptions": [],
              "message": "Project Not Found",
              "name": "p-id-na",
              "status": "ERROR",
              "version": ""
            }
          ],
          status: 'ERROR'
        }
      ]);
  });

  it('setup project four with invalid provider flow', async () => {
    await db.createProject('p-id-4', 'p-name-4');
    await db.createAnalysis('p-id-4', '4.0.1', 'p-id-4-a-id-1');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-na', 'p-id-4-a-id-1');
    await db.processAnalysis('p-id-4-a-id-1');
  });

  it('compatibility results of project 4 should not return empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-4')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "_id": like("60a8eda734836e34d353c1f3"),
          "consumer": "p-id-4",
          "consumerVersion": "4.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.2",
          "__v": 0,
          "exceptions": [
            {
              "_id": like("60a8eda7640237374cf3c60a"),
              "flow": "p-id-1-f-name-na",
              "error": "Flow Not Found"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2021-05-22T11:40:23.500Z")
        }
      ]);
  });

  it('quality gate status of project 4 should be ERROR', async () => {
    await pactum.spec()
      .get('/api/flow/v1/quality-gate/status')
      .withQueryParams('projectId', 'p-id-4')
      .withQueryParams('version', '4.0.1')
      .expectStatus(200)
      .expectJsonMatchStrict([
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              "exceptions": [
                {
                  "_id": like("60a8eda7640237374cf3c60a"),
                  "flow": "p-id-1-f-name-na",
                  "error": "Flow Not Found"
                }
              ],
              "message": "",
              "name": "p-id-1",
              "status": "FAILED",
              "version": "1.0.2"
            }
          ],
          status: 'ERROR'
        }
      ]);
  });

  after(async () => {
    await db.clean();
  });

});