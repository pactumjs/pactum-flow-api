const pactum = require('pactum');
const { like } = require('pactum-matchers');
const db = require('../helpers/db');

describe('Environment', () => {

  before(async () => {
    await db.clean();
  });

  it('get environments should be empty', async () => {
    await pactum.spec()
      .get('/api/flow/v1/environments')
      .expectStatus(200)
      .expectJsonMatchStrict([]);
  });

  it('create project', async () => {
    await db.createProject('p-id-1', 'p-name-1');
    await db.createAnalysis('p-id-1', '1.0.1', 'p-id-1-a-id-1');
    await db.createFlow('p-id-1-f-name-1', 'p-id-1-a-id-1');
    await db.processAnalysis('p-id-1-a-id-1');
  });

  it('get environments should have latest with project one', async () => {
    await pactum.spec()
      .get('/api/flow/v1/environments')
      .expectStatus(200)
      .expectJsonMatchStrict([
        {
          "_id": "latest",
          "__v": 0,
          "projects": {
            "p-id-1": like("60a8bce06b8cec323ce9d925")
          }
        }
      ]);
  });

  it('create new environment', async () => {
    await pactum.spec()
      .post('/api/flow/v1/environments')
      .withJson({
        projectId: 'p-id-1',
        version: '1.0.1',
        environment: 'dev'
      })
      .expectStatus(200);
  });

  it('get environments should have latest & dev with project one', async () => {
    await pactum.spec()
      .get('/api/flow/v1/environments')
      .expectStatus(200)
      .expectJsonMatchStrict([
        {
          "_id": "latest",
          "__v": 0,
          "projects": {
            "p-id-1": like("60a8bce06b8cec323ce9d925")
          }
        },
        {
          "_id": "dev",
          "__v": 0,
          "projects": {
            "p-id-1": like("60a8bce06b8cec323ce9d925")
          }
        }
      ]);
  });

  after(async () => {
    await db.clean();
  });

});