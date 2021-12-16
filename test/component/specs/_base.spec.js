const { request, reporter, sleep } = require('pactum');
const pf = require('pactum-flow-plugin');
const App = require('../../../src/App');
const { clean } = require('../helpers/db');

const app = new App();

function setupRequest() {
  request.setBaseUrl('http://localhost:3000');
  request.setDefaultHeaders('x-auth-token', Buffer.from('admin:admin').toString('base64'));
}

function addReporter() {
  pf.config.url = 'http://localhost:3000';
  pf.config.projectId = 'pactum_flow-api';
  pf.config.projectName = '[PACTUM] flow-api';
  pf.config.version = '1.0.1';
  pf.config.token = Buffer.from('admin:admin').toString('base64');
  reporter.add(pf.reporter);
}

before(async () => {
  await app.start();
  setupRequest();
  await clean();
  // addReporter();
});

after(async () => {
  await clean();
  await reporter.end();
  // wait for analysis process to complete
  // await sleep(500);
  await app.stop();
});