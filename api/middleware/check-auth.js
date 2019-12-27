const jwt = require('jsonwebtoken');
const {
  WellKnownJsonRes
} = require('../middleware/json-response-util');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;
    next();
  } catch (e) {
    // return res.status(401).json({
    //   status: 401,
    //   message: 'Unauthorized'
    // });
    WellKnownJsonRes.unauthorized(res);
  }
};
