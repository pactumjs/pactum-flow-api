const pactum = require('pactum');
const { request } = pactum;

request.setBaseUrl('http://localhost:3000');
request.setDefaultHeaders('x-auth-token', Buffer.from('admin:admin').toString('base64'));

async function run() {
  await pactum.spec()
    .post('/api/flow/v1/projects')
    .withJson({
      "id": "team_login-service",
      "name": "[Team] login-service",
    })
    .expectStatus(200);
  await pactum.spec()
    .post('/api/flow/v1/analyses')
    .withJson({
      "projectId": "team_login-service",
      "branch": "main",
      "version": "1.0.3",
    })
    .expectStatus(200)
    .stores('P1A1', '_id');
  await pactum.spec()
    .post('/api/flow/v1/interactions')
    .withJson([
      {
        "analysisId": "$S{P1A1}",
        "provider": "pactum_flow-api",
        "flow": "add a basic flow",
        "request": {
          "method": "POST",
          "path": "/api/flow/v1/flows",
          "body": [
            {
              "analysisId": "60275796c4aeb0084c548c3b",
              "name": "flow-name-1",
              "request": {
                "method": "GET",
                "path": "/api/path"
              },
              "response": {
                "statusCode": 200
              }
            }
          ]
        },
        "response": {
          "statusCode": 200
        }
      }
    ])
    .expectStatus(200);
  await pactum.flow('process analysis without flows & interactions')
    .post('/api/flow/v1/process/analysis')
    .withJson({
      "id": "$S{P1A1}",
    })
    .expectStatus(202);
}

run().then().catch(err => console.log(err));