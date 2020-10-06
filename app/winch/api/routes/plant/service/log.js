const express = require('express');
const router = express.Router();

const PlantServiceLogCtrl = require('../../../controllers/plant/service/log');

const checkAuth = require('../../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../../../api/middleware/parse-query');

const setAppName = require('../../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.post('/sales/:period(daily|weekly|monthly|yearly)', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantServiceLogCtrl.sales);


module.exports = router;
