const pactum = require('pactum');
const db = require('../helpers/db');
const { like } = require('pactum-matchers');

describe('Compatibility', () => {

  it('get compatibility results of invalid project should return empty array', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility')
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
    await db.createBasicFlow('p-id-1-f-name-1', 'p-id-1-a-id-1', 'p-id-1-a-id-1-f-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  it('compatibility results of project one should be empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility')
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
    await db.createBasicInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-1', 'p-id-1-a-id-1-i-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  it('compatibility results of project one should be empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility')
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

describe('Compatibility - Two Projects - One Flow & One Interaction', () => {

  before(async () => {
    await db.clean();
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createBasicFlow('p-id-1-f-name-1', 'p-id-1-a-id-1', 'p-id-1-a-id-1-f-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  before('setup project two', async () => {
    await db.createProject('p-id-2', 'p-name-2');
    await db.createAnalysis('p-id-2', '2.0.1', 'p-id-2-a-id-1');
    await db.createBasicInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-2-a-id-1', 'p-id-2-a-id-1-i-id-1');
    await db.processAnalysis('p-id-2-a-id-1');
  });

  it('compatibility results of project one should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility')
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
      .get('/api/flow/v1/compatibility')
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

  it('quality gate status of project twi should be OK', async () => {
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
      .get('/api/flow/v1/compatibility')
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
      .get('/api/flow/v1/compatibility')
      .withQueryParams('projectId', 'p-id-1')
      .withQueryParams('version', '1.0.2')
      .expectStatus(200)
      .expectJson([]);
  });

  it('run new analysis for project one then the compatibility results should be passed', async () => {
    await db.createAnalysis('p-id-1', '1.0.2', 'p-id-1-a-id-2');
    await db.createBasicFlow('p-id-1-f-name-1', 'p-id-1-a-id-2');
    await db.processAnalysis('p-id-1-a-id-2');
  });

  it('compatibility results of project one should contain both versions and should be passed', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility')
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

  after(async () => {
    await db.clean();
  });

});