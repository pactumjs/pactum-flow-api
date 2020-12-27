const pactum = require('pactum');

async function clean() {
  const ids = await pactum.spec()
    .get('/api/flow/v1/projects')
    .returns('[*]._id').toss();
  for (let i = 0; i < ids.length; i++) {
    await pactum.spec()
      .delete('/api/flow/v1/projects/{id}')
      .withPathParams('id', ids[i]);
  }
}

module.exports = {
  clean
};