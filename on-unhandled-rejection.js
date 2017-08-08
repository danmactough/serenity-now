'use strict';
module.exports = function onUnhandledRejection (reason, p) {
  const error = reason instanceof Error ? reason : new Error(reason);
  console.error('Unhandled Rejection at:', p, '\nreason:', error); // eslint-disable-line no-console
  throw error;
};
