// const pactum = require('pactum');
// const { like } = pactum.matchers;

// describe('Analysis - create, get & delete', () => {

//   before(async () => {
//     this.analysisId = '';
//     await pactum.spec()
//       .post('/api/flow/v1/projects')
//       .withJson({
//         "id": "team_login-service",
//         "name": "[Team] login-service",
//       })
//       .expectStatus(200)
//       .returns('_id');
//   });

//   it('create analysis', async () => {
//     this.analysisId = await pactum.spec()
//       .name('create analysis')
//       .post('/api/flow/v1/analysis')
//       .withJson({
//         "projectId": "team_login-service",
//         "branch": "main",
//         "version": "1.0.2",
//       })
//       .expectStatus(200)
//       .expectJsonLike({
//         "projectId": "team_login-service",
//       })
//       .expectJsonSnapshot({
//         "_id": like('5fcc58fa26bcf83298099dd5'),
//         "projectId": like('5fcc58fa26bcf83298099dd5'),
//         "createdAt": like('2020-12-06T04:37:08.165Z')
//       })
//       .returns('_id');
//   });

//   it('get analysis by id', async () => {
//     await pactum.spec()
//       .name('get analysis')
//       .get('/api/flow/v1/analysis/{id}')
//       .withPathParams('id', this.analysisId)
//       .expectStatus(200)
//       .expectJsonLike({
//         "_id": this.analysisId,
//         "projectId": "team_login-service"
//       })
//       .expectJsonSnapshot({
//         "_id": like('5fcc58fa26bcf83298099dd5'),
//         "projectId": like('5fcc58fa26bcf83298099dd5'),
//         "createdAt": like('2020-12-06T04:37:08.165Z')
//       });
//   });

//   it('get analysis', async () => {
//     await pactum.spec()
//       .get('/api/flow/v1/analysis')
//       .expectStatus(200)
//       .expectJsonLike([
//         {
//           "_id": this.analysisId,
//           "branch": "main",
//           "version": "1.0.2",
//           "flows": []
//         }
//       ]);
//   });

//   it('delete an analysis', async () => {
//     await pactum.spec()
//       .delete('/api/flow/v1/analysis/{id}')
//       .withPathParams('id', this.analysisId)
//       .expectStatus(200);
//   });

//   after(async () => {
//     await pactum.spec()
//       .delete('/api/flow/v1/projects/{id}')
//       .withPathParams('id', "team_login-service")
//       .expectStatus(200);
//   });

// });