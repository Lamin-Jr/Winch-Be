const express = require('express');
const router = express.Router();

const PlantCtrl = require('../controllers/plant');

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


module.exports = router;
