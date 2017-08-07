const restify = require('restify');

module.exports = function OnUncaughtException (req, res, route, error) {
  if (process.env.NODE_ENV !== 'test') {
    console.error(error.stack); // eslint-disable-line no-console
  }
  req.log.fatal({ route, error });
  if (!res.headersSent) {
    res.send(
      new restify.InternalServerError('Internal Server Error')
    );
  }
  if (process.env.NODE_ENV !== 'test') {
    process.abort(); //eslint-disable-line
  }
};
