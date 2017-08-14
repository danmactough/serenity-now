module.exports = function (req, res, next) {
  async function fn () {
    await Promise.resolve();
    next();
  }
  fn();
};
