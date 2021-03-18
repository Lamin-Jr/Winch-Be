const express = require('express');
const router = express.Router();

const PlantCounterCtrl = require('../../controllers/plant/counter');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');
// const queryParser = require('../../../../../api/middleware/parse-query');

const setAppName = require('../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.post('/filter-items', checkAuth, setAppName, retrieveUserProfile, PlantCounterCtrl.filterItems);

router.post('/e-customers', checkAuth, setAppName, retrieveUserProfile, PlantCounterCtrl.eCustomers);
router.post('/e-customers/:period(all|daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, PlantCounterCtrl.eCustomersByPeriod);


module.exports = router;
