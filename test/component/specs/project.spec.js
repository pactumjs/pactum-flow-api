const pactum = require('pactum');
const { like } = require('pactum-matchers');
const { clean } = require('../helpers/db');

describe('POST /api/flow/v1/projects', () => {

  it('create a new project', async () => {
    await pactum.flow('create a new project')
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
  });

  it('create a new project with existing id', async () => {
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
    await pactum.flow('create a new project with existing id')
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(400);
  });

  afterEach(async () => {
    await clean();
  });

});

describe('GET /api/flow/v1/projects', () => {

  it('get empty projects', async () => {
    await pactum.flow('get projects when there are no projects in the system')
      .get('/api/flow/v1/projects')
      .expectStatus(200)
      .expectJson([]);
  });

  it('get a single projects', async () => {
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
    await pactum.flow('get projects when there is a single in the system')
      .get('/api/flow/v1/projects')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "analysis": {
            "main": [],
            "branch": []
          },
          "_id": "team_login-service",
          "name": "[Team] login-service",
          "createdAt": like("2020-12-26T09:04:57.255Z"),
          "__v": 0
        }
      ]);
  });

  it('get multiple projects', async () => {
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_process-service",
        "name": "[Team] process-service"
      })
      .expectStatus(200);
    await pactum.flow('get projects when there are multiple in the system')
      .get('/api/flow/v1/projects')
      .expectStatus(200)
      .expectJsonMatch([
        {
          "analysis": {
            "main": [],
            "branch": []
          },
          "_id": "team_login-service",
          "name": "[Team] login-service",
          "createdAt": like("2020-12-26T09:04:57.255Z"),
          "__v": 0
        },
        {
          "analysis": {
            "main": [],
            "branch": []
          },
          "_id": "team_process-service",
          "name": "[Team] process-service",
          "createdAt": like("2020-12-26T09:04:57.255Z"),
          "__v": 0
        }
      ]);
  });

  afterEach(async () => {
    await clean();
  });

});

describe('GET /api/flow/v1/projects/{id}', () => {

  it('get a project', async () => {
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
    await pactum.flow('get a project')
      .get('/api/flow/v1/projects/{id}')
      .withPathParams('id', 'team_login-service')
      .expectStatus(200)
      .expectJsonMatch({
        "analysis": {
          "main": [],
          "branch": []
        },
        "_id": "team_login-service",
        "name": "[Team] login-service",
        "createdAt": like("2020-12-26T09:04:57.255Z"),
        "__v": 0
      });
  });

  it('get a non existing project', async () => {
    await pactum.flow('get a non existing project')
      .get('/api/flow/v1/projects/{id}')
      .withPathParams('id', 'some random project id')
      .expectStatus(404);
  });

  afterEach(async () => {
    await clean();
  });

});

describe('DELETE /api/flow/v1/projects/{id}', () => {

  it('delete a project', async () => {
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withJson({
        "id": "team_login-service",
        "name": "[Team] login-service"
      })
      .expectStatus(200);
    await pactum.flow('delete a project')
      .delete('/api/flow/v1/projects/{id}')
      .withPathParams('id', 'team_login-service')
      .expectStatus(200);
    await pactum.flow('get a non existing project')
      .get('/api/flow/v1/projects/{id}')
      .withPathParams('id', 'team_login-service')
      .expectStatus(404);
  });

  it('delete a non existing project', async () => {
    await pactum.flow('delete a non existing project')
      .delete('/api/flow/v1/projects/{id}')
      .withPathParams('id', 'some random project id')
      .expectStatus(404);
  });

  afterEach(async () => {
    await clean();
  });

});