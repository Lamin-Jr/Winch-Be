const mongoose = require('mongoose');

const RealmCtrl = require('../controllers/realm');

const { WellKnownJsonRes } = require('./json-response-util');

module.exports = (req, res, next) => {
  RealmCtrl.enrichUserDataWithPermissionsMeta(req.userData)
  .then(() => next())
  .catch(() => WellKnownJsonRes.unauthorized(res));
};
