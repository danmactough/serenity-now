'use strict';
const restify = require('restify');
const ravenClient = require('./raven-client');

module.exports = function OnUncaughtException (req, res, route, error) {
  // We can add metadata to accompany the exception
  // https://docs.sentry.io/clients/node/config/
  const tags = {
    service: req.serverName
  };
  const extra = {
    url: `[${req.method}] ${req.path()}`,
    req
  };

  ravenClient(error, { tags, extra }, function (ravenErr, SentryEventID) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(error.stack); // eslint-disable-line no-console
    }
    req.log.fatal({ route, error, SentryEventID, ravenErr });
    if (!res.headersSent) {
      res.send(
        new restify.InternalServerError(`Internal Server Error: ${SentryEventID}`)
      );
    }
    if (process.env.NODE_ENV !== 'test') {
      process.abort(); //eslint-disable-line
    }

  });
};
