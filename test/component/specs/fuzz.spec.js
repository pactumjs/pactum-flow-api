const pactum = require('pactum');

describe('Fuzz', () => {

  it('fuzz tests', async () => {
    await pactum.fuzz()
      .onSwagger('/api/pactum/flow/v1/json');
  }).timeout(10000);

});