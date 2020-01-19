const express = require('express');
const router = express.Router();

const PlantCtrl = require('../controllers/plant');
const MeterCtrl = require('../controllers/meter');
const CustomerCtrl = require('../controllers/customer');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.post('/map', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantCtrl.aggregate_for_map);
router.post('/totalizers/sold/:period(daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantCtrl.aggregate_for_totalizers);
router.post('/detail', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantCtrl.aggregate_for_plant);
router.post('/meter', checkAuth, setAppName, retrieveUserProfile, queryParser, MeterCtrl.aggregate_for_meter);
router.post('/customer', checkAuth, setAppName, retrieveUserProfile, queryParser, CustomerCtrl.aggregate_for_customer);


module.exports = router;
