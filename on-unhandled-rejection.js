'use strict';
module.exports = function onUnhandledRejection (reason, p) {
  const error = reason instanceof Error ? reason : new Error(reason);
  console.error('Unhandled Rejection at:', p, '\nreason:', error); // eslint-disable-line no-console
  const currentDomain = p.domain;
  if (currentDomain) {
    currentDomain.run(function () {
      throw error;
    });
  }
  else {
    throw error;
  }
};
