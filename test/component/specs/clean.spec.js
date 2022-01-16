const pactum = require('pactum');
const { like } = require('pactum-matchers');
const db = require('../helpers/db');

const config = require('../../../src/config');

describe('Clean Up - Analyses', () => {

  before(async () => {
    await db.clean();
    config.housekeeping.maxVersions = 1;
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  after(async () => {
    await db.clean();
    config.housekeeping.maxVersions = 20;
  });

  it('create one more analysis should delete 1.0.1 version', async () => {
    await db.createAnalysis('p-id-1', '1.0.2', 'p-id-1-a-id-2');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-2');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-2');
    await db.processAnalysis('p-id-1-a-id-2');
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-1}')
      .expectStatus(404);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-2}')
      .expectStatus(200);
  });

  // depends on above test
  it('create one more analysis should delete the 1.0.2 version', async () => {
    await db.createAnalysis('p-id-1', '1.0.3', 'p-id-1-a-id-3');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-3');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-3');
    await db.processAnalysis('p-id-1-a-id-3');
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-2}')
      .expectStatus(404);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-3}')
      .expectStatus(200);
  });

});

describe('Clean Up - Analyses tied to Releases', () => {

  before(async () => {
    await db.clean();
    config.housekeeping.maxVersions = 1;
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
    await db.saveProjectInEnvironment('test', 'p-id-1', '1.0.1');
  });

  after(async () => {
    await db.clean();
    config.housekeeping.maxVersions = 20;
  });

  it('create one more analysis should not delete 1.0.1 version', async () => {
    await db.createAnalysis('p-id-1', '1.0.2', 'p-id-1-a-id-2');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-2');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-2');
    await db.processAnalysis('p-id-1-a-id-2');
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-1}')
      .expectStatus(200);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-2}')
      .expectStatus(200);
  });

  // depends on above test
  it('create one more analysis should delete the 1.0.2 version', async () => {
    await db.createAnalysis('p-id-1', '1.0.3', 'p-id-1-a-id-3');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-3');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-3');
    await db.processAnalysis('p-id-1-a-id-3');
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-1}')
      .expectStatus(200);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-2}')
      .expectStatus(404);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-3}')
      .expectStatus(200);
  });

  // depends on above test
  it('delete the test env and create one more analysis should delete the versions 1.0.1 and 1.0.3', async () => {
    await pactum.spec()
      .delete('/api/flow/v1/environments/test')
      .expectStatus(200)
      .expectJson({
        "n": 1,
        "ok": 1,
        "deletedCount": 1
      });
    await db.createAnalysis('p-id-1', '1.0.4', 'p-id-1-a-id-4');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-4');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-4');
    await db.processAnalysis('p-id-1-a-id-4');
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-1}')
      .expectStatus(404);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-3}')
      .expectStatus(404);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-4}')
      .expectStatus(200);
  });

});

describe('Clean Up - Analyses - Config changed', () => {

  before(async () => {
    await db.clean();
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
    await db.createAnalysis('p-id-1', '1.0.2', 'p-id-1-a-id-2');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-2');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-2');
    await db.processAnalysis('p-id-1-a-id-2');
    await db.createAnalysis('p-id-1', '1.0.3', 'p-id-1-a-id-3');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-3');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-3');
    await db.processAnalysis('p-id-1-a-id-3');
    config.housekeeping.maxVersions = 2;
  });

  after(async () => {
    await db.clean();
    config.housekeeping.maxVersions = 20;
  });

  it('create one more analysis should delete the versions 1.0.1 and 1.0.2', async () => {
    await db.createAnalysis('p-id-1', '1.0.4', 'p-id-1-a-id-4');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-4');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-4');
    await db.processAnalysis('p-id-1-a-id-4');
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-1}')
      .expectStatus(404);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-2}')
      .expectStatus(404);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-3}')
      .expectStatus(200);
    await pactum.spec()
      .get('/api/flow/v1/analyses/{id}')
      .withPathParams('id', '$S{p-id-1-a-id-4}')
      .expectStatus(200);
  });

});

describe('Clean Up - Results', () => {

  before(async () => {
    await db.clean();
  });

  before('setup project one', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
    await db.createAnalysis('p-id-1', '1.0.2', 'p-id-1-a-id-2');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-2');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-2');
    await db.processAnalysis('p-id-1-a-id-2');
    await db.createAnalysis('p-id-1', '1.0.3', 'p-id-1-a-id-3');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-3');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-3');
    await db.processAnalysis('p-id-1-a-id-3');
  });

  before('setup project two', async () => {
    await db.createProject('p-id-2', 'p-name-2');
    await db.createAnalysis('p-id-2', '2.0.1', 'p-id-2-a-id-1');
    await db.createFlow('p-id-2-f-name-1', 'p-id-2-a-id-1');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-2-a-id-1');
    await db.processAnalysis('p-id-2-a-id-1');
    await db.createAnalysis('p-id-2', '2.0.2', 'p-id-2-a-id-2');
    await db.createFlow('p-id-2-f-name-1', 'p-id-2-a-id-2');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-2-a-id-2');
    await db.processAnalysis('p-id-2-a-id-2');
    await db.createAnalysis('p-id-2', '2.0.3', 'p-id-2-a-id-3');
    await db.createFlow('p-id-2-f-name-1', 'p-id-2-a-id-3');
    await db.createInteraction('p-id-1', 'p-id-2-f-name-1', 'p-id-2-a-id-3');
    await db.processAnalysis('p-id-2-a-id-3');
  });

  before('setup project three', async () => {
    await db.createProject('p-id-3', 'p-name-3');
    await db.createAnalysis('p-id-3', '3.0.1', 'p-id-3-a-id-1');
    await db.createFlow('p-id-3-f-name-1', 'p-id-3-a-id-1');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-3-a-id-1');
    await db.processAnalysis('p-id-3-a-id-1');
    await db.createAnalysis('p-id-3', '3.0.2', 'p-id-3-a-id-2');
    await db.createFlow('p-id-3-f-name-1', 'p-id-3-a-id-2');
    await db.createInteraction('p-id-1', 'p-id-1-f-name-1', 'p-id-3-a-id-2');
    await db.processAnalysis('p-id-3-a-id-2');
  });

  before('setup environments', async () => {
    await db.saveProjectInEnvironment('dev', 'p-id-2', '2.0.2');
  });

  before('set max results', () => {
    config.housekeeping.maxResults = 1;
  })

  after(async () => {
    await db.clean();
    config.housekeeping.maxResults = 100;
  });

  it('create more analysis should delete the results', async () => {
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .expectJsonMatchStrict([
        {
          "_id": like("61e3e4c65308eb3bc111fc80"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.3",
          "provider": "p-id-2",
          "providerVersion": "2.0.1",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:26:30.166Z")
        },
        {
          "_id": like("61e3e4c65308eb3bc111fcb3"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.3",
          "provider": "p-id-2",
          "providerVersion": "2.0.2",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:26:30.502Z")
        },
        {
          "_id": like("61e3e4c65308eb3bc111fce6"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.3",
          "provider": "p-id-2",
          "providerVersion": "2.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:26:30.850Z")
        },
        {
          "_id": like("61e3e4c65308eb3bc111fc81"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:26:30.166Z")
        },
        {
          "_id": like("61e3e4c65308eb3bc111fcb4"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.2",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:26:30.502Z")
        },
        {
          "_id": like("61e3e4c65308eb3bc111fce7"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.3",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [
            {
              "_id": like("61e3e4c642f36709ff212ab7"),
              "flow": "p-id-2-f-name-1",
              "error": "Flow Not Found"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2022-01-16T09:26:30.851Z")
        },
        {
          "_id": like("61e3e4c75308eb3bc111fd14"),
          "consumer": "p-id-3",
          "consumerVersion": "3.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:26:31.142Z")
        },
        {
          "_id": like("61e3e4c75308eb3bc111fd43"),
          "consumer": "p-id-3",
          "consumerVersion": "3.0.2",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:26:31.500Z")
        }
      ]);
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-2')
      .expectJsonMatchStrict([
        {
          "_id": like("61e3e5ae5308eb3bc111fea6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3e5ae5308eb3bc111fea6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.2",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3e5ae5308eb3bc111fea6"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.3",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [
            {
              "_id": like("61e3e5ae5308eb3bc111fea6"),
              "flow": "p-id-2-f-name-1",
              "error": "Flow Not Found"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3e5ae5308eb3bc111fea6"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.3",
          "provider": "p-id-2",
          "providerVersion": "2.0.1",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3e5ae5308eb3bc111fea6"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.3",
          "provider": "p-id-2",
          "providerVersion": "2.0.2",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3e5ae5308eb3bc111fea6"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.3",
          "provider": "p-id-2",
          "providerVersion": "2.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        }
      ]);
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-3')
      .expectJsonMatchStrict([
        {
          "_id": like("61e3e64e5308eb3bc11200f4"),
          "consumer": "p-id-3",
          "consumerVersion": "3.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:33:02.122Z")
        },
        {
          "_id": like("61e3e64e5308eb3bc1120123"),
          "consumer": "p-id-3",
          "consumerVersion": "3.0.2",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:33:02.456Z")
        }
      ]);
    await db.createAnalysis('p-id-1', '1.0.4', 'p-id-1-a-id-4');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-4');
    await db.createInteraction('p-id-2', 'p-id-2-f-name-1', 'p-id-1-a-id-4');
    await db.processAnalysis('p-id-1-a-id-4');
    await db.createAnalysis('p-id-2', '2.0.4', 'p-id-2-a-id-4');
    await db.createFlow('p-id-2-f-name-1', 'p-id-2-a-id-4');
    await db.createInteraction('p-id-1', 'p-id-2-f-name-1', 'p-id-2-a-id-4');
    await db.processAnalysis('p-id-2-a-id-4');
    await db.createAnalysis('p-id-3', '3.0.3', 'p-id-3-a-id-3');
    await db.createFlow('p-id-3-f-name-1', 'p-id-3-a-id-3');
    await db.createInteraction('p-id-1', 'p-id-2-f-name-1', 'p-id-3-a-id-3');
    await db.processAnalysis('p-id-3-a-id-3');
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-1')
      .expectJsonMatchStrict([{
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-1",
        "consumerVersion": "1.0.3",
        "provider": "p-id-2",
        "providerVersion": "2.0.2",
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-1",
        "consumerVersion": "1.0.3",
        "provider": "p-id-2",
        "providerVersion": "2.0.3",
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-1",
        "consumerVersion": "1.0.4",
        "provider": "p-id-2",
        "providerVersion": "2.0.2",
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-1",
        "consumerVersion": "1.0.4",
        "provider": "p-id-2",
        "providerVersion": "2.0.3",
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-1",
        "consumerVersion": "1.0.4",
        "provider": "p-id-2",
        "providerVersion": "2.0.4",
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-2",
        "consumerVersion": "2.0.2",
        "provider": "p-id-1",
        "providerVersion": "1.0.3",
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-2",
        "consumerVersion": "2.0.2",
        "provider": "p-id-1",
        "providerVersion": "1.0.4",
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-2",
        "consumerVersion": "2.0.3",
        "provider": "p-id-1",
        "providerVersion": "1.0.4",
        "exceptions": [
          {
            "_id": like("61e3efd25308eb3bc1121123"),
            "flow": "p-id-2-f-name-1",
            "error": "Flow Not Found"
          }
        ],
        "status": "FAILED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-3",
        "consumerVersion": "3.0.2",
        "provider": "p-id-1",
        "providerVersion": "1.0.4",
        "exceptions": [],
        "status": "PASSED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-2",
        "consumerVersion": "2.0.4",
        "provider": "p-id-1",
        "providerVersion": "1.0.4",
        "exceptions": [
          {
            "_id": like("61e3efd25308eb3bc1121123"),
            "flow": "p-id-2-f-name-1",
            "error": "Flow Not Found"
          }
        ],
        "status": "FAILED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      },
      {
        "_id": like("61e3efd25308eb3bc1121123"),
        "consumer": "p-id-3",
        "consumerVersion": "3.0.3",
        "provider": "p-id-1",
        "providerVersion": "1.0.4",
        "exceptions": [
          {
            "_id": like("61e3efd25308eb3bc1121123"),
            "flow": "p-id-2-f-name-1",
            "error": "Flow Not Found"
          }
        ],
        "status": "FAILED",
        "verifiedAt": like("2022-01-16T09:30:22.799Z")
      }
      ]);
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-2')
      .expectJsonMatchStrict([
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.2",
          "provider": "p-id-1",
          "providerVersion": "1.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.2",
          "provider": "p-id-1",
          "providerVersion": "1.0.4",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.3",
          "provider": "p-id-1",
          "providerVersion": "1.0.4",
          "exceptions": [
            {
              "_id": like("61e3efd25308eb3bc1121123"),
              "flow": "p-id-2-f-name-1",
              "error": "Flow Not Found"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-2",
          "consumerVersion": "2.0.4",
          "provider": "p-id-1",
          "providerVersion": "1.0.4",
          "exceptions": [
            {
              "_id": like("61e3efd25308eb3bc1121123"),
              "flow": "p-id-2-f-name-1",
              "error": "Flow Not Found"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.3",
          "provider": "p-id-2",
          "providerVersion": "2.0.2",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.3",
          "provider": "p-id-2",
          "providerVersion": "2.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.4",
          "provider": "p-id-2",
          "providerVersion": "2.0.2",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.4",
          "provider": "p-id-2",
          "providerVersion": "2.0.3",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-1",
          "consumerVersion": "1.0.4",
          "provider": "p-id-2",
          "providerVersion": "2.0.4",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        }
      ])
    await pactum.spec()
      .get('/api/flow/v1/compatibility/project')
      .withQueryParams('projectId', 'p-id-3')
      .expectJsonMatchStrict([
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-3",
          "consumerVersion": "3.0.2",
          "provider": "p-id-1",
          "providerVersion": "1.0.4",
          "exceptions": [],
          "status": "PASSED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        },
        {
          "_id": like("61e3efd25308eb3bc1121123"),
          "consumer": "p-id-3",
          "consumerVersion": "3.0.3",
          "provider": "p-id-1",
          "providerVersion": "1.0.4",
          "exceptions": [
            {
              "_id": like("61e3efd25308eb3bc1121123"),
              "flow": "p-id-2-f-name-1",
              "error": "Flow Not Found"
            }
          ],
          "status": "FAILED",
          "verifiedAt": like("2022-01-16T09:30:22.799Z")
        }
      ])
  });

});