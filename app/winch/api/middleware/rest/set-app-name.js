module.exports = (req, res, next) => {
  req.userData['app-name'] = 'winch';
  next();
};
