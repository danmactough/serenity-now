'use strict';
const Raven = require('raven'); // Sentry client
const pkg = require('./package.json');

let shouldSendCallback;

// No SENTRY_DSN is our cue that we don't want to send exceptions to Sentry.
// So, we configure Raven to log exceptions ONLY.
if (!process.env.SENTRY_DSN) {
  // The url parts are arbitrary but allow it to pass Sentry validation
  process.env.SENTRY_DSN = `http://user:password@localhost:443/${pkg.name}/443`;
  shouldSendCallback = props => {
    delete props.modules;
    console.error(props); // eslint-disable-line no-console
    return false;
  };
}

// This handles when someone does:
//   throw "something awesome";
// We synthesize an Error here so we can extract a (rough) stack trace.
const sentryExceptionHandler = (wasLogged, err) => {
  if (!(err instanceof Error)) {
    err = new Error(err);
  }
  throw err;
};

Raven.config({
  release: pkg.version,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  captureUnhandledRejections: false,
  shouldSendCallback
}).install(sentryExceptionHandler);

module.exports = Raven.captureException.bind(Raven);
