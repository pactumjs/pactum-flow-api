const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

const config = require('./config');
const swaggerMiddleware = require('./middleware/swagger.middleware');

class App {

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
  }

  async init() {
    this.handleInterruptions();
    await this.initDatabase();
    await this.initMiddleware();
  }

  handleInterruptions() {
    process.on('SIGINT', async function () {
      await closeDatabaseConnection();
      process.exit();
    });
  }

  async initDatabase() {
    const { mongo } = config;
    const cs = `'mongodb://${mongo.host}:${mongo.port}/${mongo.name}`;
    await mongoose.connect(cs, config.mongo.options);
    console.log('Database connection created');
  }

  async initMiddleware() {
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
      await this.stop();
    }
  }

  async stop() {
    try {
      await closeDatabaseConnection();
      this.server.close();
      console.log('Server stopped');
    } catch (error) {
      console.log(error);
    }
  }

}

async function closeDatabaseConnection() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

module.exports = App;