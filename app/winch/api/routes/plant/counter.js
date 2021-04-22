const express = require('express');
const router = express.Router();

const PlantCounterCtrl = require('../../controllers/plant/counter');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');
// const queryParser = require('../../../../../api/middleware/parse-query');

const setAppName = require('../../middleware/rest/set-app-name');

const setupToDefaultByPeriod = (req, res, next) => {
  req.params.period = 'daily';
  next();
};

const checkS2s = (req, res, next) => {
  require('../../../../../api/controllers/s2s').apiTokenExists(req.query['s2s'])
    .then(outcome => outcome === true ? next() : WellKnownJsonRes.unauthorized(res))
    .catch(error => WellKnownJsonRes.error(res, 500, ['unable to retrieve credentials']));
}


//
// public
// -> nothing for now

//
// token-protected
router.post('/filter-items', checkAuth, setAppName, retrieveUserProfile, PlantCounterCtrl.filterItems);

router.post('/e-customers', checkAuth, setAppName, retrieveUserProfile, setupToDefaultByPeriod, PlantCounterCtrl.eCustomersByPeriod);
router.post('/e-customers/:period(all|daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, PlantCounterCtrl.eCustomersByPeriod);

//
// s2s-protected
router.get('/co2-avoidance', checkS2s, PlantCounterCtrl.eCo2Avoidance);


module.exports = router;
