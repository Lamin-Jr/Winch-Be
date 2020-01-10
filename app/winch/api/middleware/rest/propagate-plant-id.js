module.exports = (req, res, next) => {
  if (!req._parentParams) {
    req._parentParams = {};
  }

  req._parentParams.plantId = req.params.plantId;

  next();
};
