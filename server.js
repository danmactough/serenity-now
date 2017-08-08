const restify = require('restify');
const bunyan = require('bunyan');
const pkg = require('./package.json');
const name = pkg.name;
const version = pkg.version;

const onUncaughtException = require('./on-uncaught-exception');
const onUnhandledRejection = require('./on-unhandled-rejection');
const funkyMiddleware = require('./funky-middleware');

function createServer (config) {
  const server = restify.createServer({
    name,
    version,
    log: bunyan.createLogger({
      name,
      level: config.logLevel
    })
  });

  const auditLogger = restify.auditLogger({
    log: bunyan.createLogger({ name: 'audit' }),
    body: config.auditBody
  });
  server.on('after', auditLogger);
  server.on('uncaughtException', onUncaughtException);
  process.on('unhandledRejection', onUnhandledRejection);
  // Handle generic errors, which get emitted as ''
  server.on('', function(req, res, err) {
    if (err) {
      onUncaughtException(req, res, req.path(), err);
    }
  });
  server.use(restify.requestLogger());

  server.get('/ok', function (req, res, next) {
    res.send({ message: 'ok' });
    next();
  });

  server.get('/simple-error', function (req, res, next) {
    next(new restify.BadRequestError('Simple Error'));
  });

  server.get('/throws', function () {
    throw new Error('Oops!');
  });

  server.get('/throws-with-promise', funkyMiddleware, function () {
    throw new Error('Yikes!');
  });

  server.listen(config.port, function () {
    const addr = this.address();
    console.log(`Server listening on port ${addr.port}`); // eslint-disable-line no-console
  });

  return server;
}

module.exports = { createServer };

if (require.main === module) {
  const PORT = 'PORT' in process.env ? parseInt(process.env.PORT, 10) : 3000;
  const logLevel = process.env.LOG_LEVEL || 'debug';
  const auditBody = process.env.AUDIT_BODY !== 'false';
  createServer({
    port: PORT,
    logLevel,
    auditBody
  });
}
