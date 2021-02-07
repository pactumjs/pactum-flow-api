const SEM = require('swagger-express-mw');
const SUI = require('swagger-tools/middleware/swagger-ui');
const authTokenHandler = require('./auth.handler');

function init(app, rootDir) {
  return new Promise((resolve, reject) => {
    try {
      const swaggerConfig = {
        appRoot: rootDir,
        swaggerSecurityHandlers: {
          AuthToken: authTokenHandler
        }
      };
      SEM.create(swaggerConfig, (err, se) => {
        if (err) throw err;
        se.register(app);
        const options = {
          swaggerUi: se.runner.config.swagger.doc.ui,
          apiDocs: se.runner.config.swagger.doc.raw
        };
        app.use(SUI(se.runner.swagger, options));
        app.use(error_middleware);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

function error_middleware(err, _, res, __) {
  if (!res.headersSent) {
    console.log(err);
    res.status(err.status || 500).send(err);
  }
}

module.exports = {
  init
};