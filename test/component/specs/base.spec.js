const { request } = require('pactum');
const App = require('../../../src/App');

const app = new App();

before(async () => {
  await app.start();
  request.setBaseUrl('http://localhost:3000');
});

after(async () => {
  app.stop();
});