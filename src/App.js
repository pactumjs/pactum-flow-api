const express = require('express');
const http = require('http');

const swaggerMiddleware = require('./middleware/swagger.middleware');

class App {

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
  }

  async init() {
    this.app.use(express.json());
    await swaggerMiddleware.init(this.app, __dirname);
  }

  async start() {
    try {
      await this.init();
      this.server.listen(3000);
      console.log('Pactum Flow API Server started on port 3000');
    } catch (error) {
      console.log(error);
    }
  }

  stop() {
    this.server.close();
  }

}

module.exports = App;