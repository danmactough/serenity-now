module.exports = function (req, res, next) {
  Promise.resolve()
    .then(() => {
      next();
    });
};
