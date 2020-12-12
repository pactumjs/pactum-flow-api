const pactum = require('pactum');
const { like } = pactum.matchers;

describe('Project - create, get & delete', () => {

  it('create project', async () => {
    this.id = await pactum.spec()
      .name('create project')
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service",
      })
      .expectStatus(200)
      .expectJsonSnapshot({
        _id: "team_login-service",
        createdAt: like('2020-12-06T04:37:08.165Z')
      })
      .returns('_id');
  });

  it('get project by id', async () => {
    await pactum.spec()
      .name('get project')
      .get('/api/flow/v1/projects/{id}')
      .withPathParams('id', "team_login-service")
      .expectStatus(200)
      .expectJsonSnapshot({
        _id: like('5fcc58fa26bcf83298099dd5'),
        createdAt: like('2020-12-06T04:37:08.165Z')
      })
      .expectJsonLikeAt('_id', this.id);
  });

  it('get all projects', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .expectStatus(200)
      .expectJsonLike([
        {
          _id: "team_login-service",
          name: '[Team] login-service'
        }
      ]);
  });

  it('delete a project', async () => {
    await pactum.spec()
      .delete('/api/flow/v1/projects/{id}')
      .withPathParams('id', "team_login-service")
      .expectStatus(200);
  });

});