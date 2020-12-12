const pactum = require('pactum');

describe('Health', () => {

  it('get', async () => {
    await pactum.spec()
      .get('/api/flow/v1/health')
      .expectStatus(200);
  });

});