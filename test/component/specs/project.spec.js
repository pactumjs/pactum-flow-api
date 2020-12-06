const pactum = require('pactum');
const { like } = pactum.matchers;

describe('Project - create, get & delete', () => {

  before(() => {
    this.id = '';
  });

  it('create a new project with key & name', async () => {
    this.id = await pactum.spec()
      .post('/api/pactum/flow/v1/project')
      .withJson({
        "key": "team_login-service",
        "name": "[Team] login-service",
      })
      .expectStatus(200)
      .expectJsonMatch({
        _id: like('5fcc58fa26bcf83298099dd5'),
        key: 'team_login-service',
        name: '[Team] login-service',
        createdAt: like('2020-12-06T04:37:08.165Z')
      })
      .returns('_id');
  });

  it('get project by id', async () => {
    await pactum.spec()
      .get('/api/pactum/flow/v1/project/{id}')
      .withPathParams('id', this.id)
      .expectStatus(200)
      .expectJsonMatch({
        _id: this.id,
        key: 'team_login-service',
        name: '[Team] login-service',
        createdAt: like('2020-12-06T04:37:08.165Z')
      });
  });

  it('get all projects', async () => {
    await pactum.spec()
      .get('/api/pactum/flow/v1/project')
      .expectStatus(200)
      .expectJsonLike([
        {
          _id: this.id,
          key: 'team_login-service',
          name: '[Team] login-service'
        }
      ]);
  });

  it('delete a project', async () => {
    await pactum.spec()
      .delete('/api/pactum/flow/v1/project/{id}')
      .withPathParams('id', this.id)
      .expectStatus(200);
  });

});