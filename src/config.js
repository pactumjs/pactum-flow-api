const env = process.env;

const config = {
  mongo: {
    host: env.DB_HOST || 'localhost',
    port: env.DB_PORT || 27017,
    name: env.DB_NAME || 'pactum',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  },
  auth: {
    token: env.AUTH_TOKEN || Buffer.from('admin:admin').toString('base64')
  }
};

if (env.DB_USER || env.DB_PASSWORD) {
  config.mongo.options.auth = {};
  config.mongo.options.auth.user = env.DB_USER;
  config.mongo.options.auth.password = env.DB_PASSWORD;
}

if (env.DB_SSL) config.mongo.options.ssl = (env.DB_SSL === 'true');
if (env.DB_REPLICA_SET) config.mongo.options.replicaSet = env.DB_REPLICA_SET;
if (env.DB_RETRY_WRITES) config.mongo.options.retryWrites = (env.DB_RETRY_WRITES === 'true');

module.exports = config;
