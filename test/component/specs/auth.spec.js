const pactum = require('pactum');
const { request } = pactum;
const jwt = require('jsonwebtoken');

const config = require('../../../src/config');

let admin_token, scanner_token, viewer_token;

describe('Auth', () => {

  before(() => {
    admin_token = jwt.sign({ session: { user: 'admin', role: 'admin' } }, config.auth.token, { expiresIn: '30m' });
    scanner_token = jwt.sign({ session: { user: 'scanner', role: 'scanner' } }, config.auth.token, { expiresIn: '30m' });
    viewer_token = jwt.sign({ session: { user: 'viewer', role: 'viewer' } }, config.auth.token, { expiresIn: '30m' });
    request.removeDefaultHeaders();
  });

  after(() => {
    request.setDefaultHeaders('x-auth-token', Buffer.from('admin:admin').toString('base64'));
  });
  
  it('get projects using admin token', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-session-token', admin_token)
      .expectStatus(200)
  });

  it('get projects using scanner token', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-session-token', scanner_token)
      .expectStatus(200)
  });

  it('get projects using viewer token', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-session-token', viewer_token)
      .expectStatus(200)
  });

  it('post projects using viewer token', async () => {
    await pactum.spec()
      .post('/api/flow/v1/projects')
      .withHeaders('x-session-token', viewer_token)
      .expectStatus(403)
  });

  it('delete project using scanner token', async () => {
    await pactum.spec()
      .delete('/api/flow/v1/projects/abc')
      .withHeaders('x-session-token', scanner_token)
      .expectStatus(403)
  });

  it('get projects without any token', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .expectStatus(403)
  });

  it('get projects with invalid auth token', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-auth-token', 'admin_token')
      .expectStatus(403)
  });

  it('get projects with empty auth token', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-auth-token', '')
      .expectStatus(403)
  });

  it('get projects with auth token as true', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-auth-token', true)
      .expectStatus(403)
  });

  it('get projects with invalid session token', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-session-token', jwt.sign({ session: { user: 'admin', role: 'admin' } }, 'config.auth.token', { expiresIn: '30m' }))
      .expectStatus(403)
  });

  it('get projects with empty session token', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-session-token', '')
      .expectStatus(403)
  });

  it('get projects with session token as true', async () => {
    await pactum.spec()
      .get('/api/flow/v1/projects')
      .withHeaders('x-session-token', true)
      .expectStatus(403)
  });
  
});