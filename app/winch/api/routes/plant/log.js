const express = require('express');
const router = express.Router();

const PlantLogCtrl = require('../../controllers/plant/log');

const MeterCtrl = require('../../controllers/meter');
const PlantGenerationLogCtrl = require('../../controllers/plant-generation-log');
const MeterReadingLogCtrl = require('../../controllers/meter-reading-log');
const CustomerCtrl = require('../../controllers/customer');
const AgentCtrl = require('../../controllers/agent');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../../api/middleware/parse-query');

const setAppName = require('../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.post('/e-gen/:period(daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantLogCtrl.e_gen);
router.post('/e-deliv/:period(daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantLogCtrl.e_deliv);
router.post('/e-deliv-cat/:period(all|daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantLogCtrl.e_deliv_cat);
router.post('/plant-generation/:period(hourly|daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantGenerationLogCtrl.aggregate);
router.post('/meter-reading/:period(hourly|daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, queryParser, MeterReadingLogCtrl.aggregate);
router.post('/forecast/:period(all|daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantLogCtrl.forecast);
router.post('/meter', checkAuth, setAppName, retrieveUserProfile, queryParser, MeterCtrl.aggregate_for_meter);
router.post('/customer', checkAuth, setAppName, retrieveUserProfile, queryParser, CustomerCtrl.aggregate_for_customer);
router.post('/agent', checkAuth, setAppName, retrieveUserProfile, queryParser, AgentCtrl.aggregate_for_agent);


module.exports = router;
