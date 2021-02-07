const { request, reporter, sleep } = require('pactum');
const pf = require('pactum-flow-plugin');
const App = require('../../../src/App');
const { clean } = require('../helpers/db');

const app = new App();

before(async () => {
  await app.start();
  request.setBaseUrl('http://localhost:3000');
  request.setDefaultHeaders('x-auth-token', Buffer.from('admin:admin').toString('base64'));
  await clean();
  pf.config.url = 'http://localhost:3000';
  pf.config.projectId = 'pactum_flow-api';
  pf.config.projectName = '[PACTUM] flow-api';
  pf.config.version = '1.0.1';
  pf.config.token = Buffer.from('admin:admin').toString('base64');
  reporter.add(pf.reporter);
});

after(async () => {
  await clean();
  await reporter.end();
  await sleep(500); // wait for analysis process to complete
  await app.stop();
});